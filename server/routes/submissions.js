import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomBytes } from "crypto";
import db, { uploadsDir } from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${randomBytes(8).toString("hex")}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Students: list their own submissions. Teachers: list all.
router.get("/", requireAuth, (req, res) => {
  let rows;
  let count;

  if (req.user.role === "teacher") {
    rows = db
      .prepare(
        `SELECT sub.*, a.title AS assignment_title, a.subject,
                s.username AS student_username
         FROM submissions sub
         JOIN assignments a ON sub.assignment_id = a.id
         JOIN students s ON sub.student_id = s.id
         ORDER BY sub.created_at DESC`
      )
      .all();

    count = db.prepare("SELECT COUNT(*) as total FROM submissions").get().total;
  } else {
    rows = db
      .prepare(
        `SELECT sub.*, a.title AS assignment_title, a.subject
         FROM submissions sub
         JOIN assignments a ON sub.assignment_id = a.id
         WHERE sub.student_id = ?
         ORDER BY sub.created_at DESC`
      )
      .all(req.user.id);

    count = db
      .prepare("SELECT COUNT(*) as total FROM submissions WHERE student_id = ?")
      .get(req.user.id).total;
  }

  const stats = {
    total: count,
    review: rows.filter((row) => row.status === "review").length,
    approved: rows.filter((row) => row.status === "approved").length,
    revision: rows.filter((row) => row.status === "revision").length,
  };

  return res.json({ submissions: rows, stats });
});

// Student creates a submission for an assignment.
router.post("/", requireAuth, requireRole("student"), upload.single("file"), (req, res) => {
  const assignmentId = Number(req.body.assignment_id);
  const note = (req.body.note || "").toString().trim();

  if (!assignmentId || !req.file) {
    return res.status(400).json({
      message: "Select an assignment and upload a file",
    });
  }

  const assignment = db
    .prepare("SELECT id FROM assignments WHERE id = ?")
    .get(assignmentId);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const existing = db
    .prepare(
      "SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?"
    )
    .get(assignmentId, req.user.id);

  if (existing) {
    return res.status(409).json({
      message: "You have already submitted this assignment",
    });
  }

  const result = db
    .prepare(
      `INSERT INTO submissions (assignment_id, student_id, note, filename, original_name)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      assignmentId,
      req.user.id,
      note,
      req.file.filename,
      req.file.originalname
    );

  return res.status(201).json({
    message: "Submission uploaded successfully",
    submission_id: result.lastInsertRowid,
  });
});

// Teacher reviews a submission.
router.patch("/:id", requireAuth, requireRole("teacher"), (req, res) => {
  const status = (req.body.status || "").toString().trim();

  if (!["review", "approved", "revision"].includes(status)) {
    return res.status(400).json({ message: "Invalid submission status" });
  }

  const result = db
    .prepare("UPDATE submissions SET status = ? WHERE id = ?")
    .run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Submission not found" });
  }

  return res.json({ message: "Submission updated" });
});

export { storage as _storage };
export default router;