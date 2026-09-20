import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const assignments = db
    .prepare(
      `SELECT
         a.id, a.title, a.subject, a.description, a.due_date, a.teacher_id,
         a.created_at, s.username AS teacher_username
       FROM assignments a
       JOIN students s ON a.teacher_id = s.id
       ORDER BY a.due_date ASC`
    )
    .all();

  const withStatus = assignments.map((assignment) => {
    const submission = db
      .prepare(
        "SELECT status FROM submissions WHERE assignment_id = ? AND student_id = ?"
      )
      .get(assignment.id, req.user.id);

    return {
      ...assignment,
      my_status: submission ? submission.status : (req.user.role === "teacher" ? "assigned" : "pending"),
    };
  });

  return res.json({ assignments: withStatus });
});

router.post("/", requireAuth, requireRole("teacher"), (req, res) => {
  const { title, subject, description, due_date } = req.body || {};

  const cleanTitle = (title || "").toString().trim();
  const cleanSubject = (subject || "").toString().trim();
  const cleanDueDate = (due_date || "").toString().trim();
  const cleanDescription = (description || "").toString().trim();

  if (!cleanTitle || !cleanSubject || !cleanDueDate) {
    return res.status(400).json({
      message: "Title, subject, and due date are required",
    });
  }

  const result = db
    .prepare(
      `INSERT INTO assignments (title, subject, description, due_date, teacher_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(cleanTitle, cleanSubject, cleanDescription, cleanDueDate, req.user.id);

  return res.status(201).json({
    message: "Assignment created successfully",
    assignment_id: result.lastInsertRowid,
  });
});

router.get("/:id", requireAuth, (req, res) => {
  const assignment = db
    .prepare(
      `SELECT a.*, s.username AS teacher_username
       FROM assignments a
       JOIN students s ON a.teacher_id = s.id
       WHERE a.id = ?`
    )
    .get(req.params.id);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  return res.json({ assignment });
});

export default router;