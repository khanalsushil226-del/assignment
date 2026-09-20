import { Router } from "express";
import db from "../db.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

// Students list their own questions; teachers list all unanswered/correct ones.
router.get("/", requireAuth, (req, res) => {
  let rows;

  if (req.user.role === "teacher") {
    rows = db
      .prepare(
        `SELECT q.*, s.username AS student_username
         FROM questions q
         JOIN students s ON q.student_id = s.id
         ORDER BY q.created_at DESC`
      )
      .all();
  } else {
    rows = db
      .prepare(
        "SELECT * FROM questions WHERE student_id = ? ORDER BY created_at DESC"
      )
      .all(req.user.id);
  }

  return res.json({ questions: rows });
});

router.post("/", requireAuth, requireRole("student"), (req, res) => {
  const content = (req.body.content || "").toString().trim();
  const assignmentId = req.body.assignment_id
    ? Number(req.body.assignment_id)
    : null;

  if (!content) {
    return res.status(400).json({ message: "Question cannot be empty" });
  }

  const result = db
    .prepare(
      "INSERT INTO questions (assignment_id, student_id, content) VALUES (?, ?, ?)"
    )
    .run(assignmentId, req.user.id, content);

  return res.status(201).json({
    message: "Question submitted",
    question_id: result.lastInsertRowid,
  });
});

// Teacher answers a question.
router.patch("/:id", requireAuth, requireRole("teacher"), (req, res) => {
  const answer = (req.body.answer || "").toString().trim();

  if (!answer) {
    return res.status(400).json({ message: "Answer cannot be empty" });
  }

  const result = db
    .prepare("UPDATE questions SET answer = ? WHERE id = ?")
    .run(answer, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Question not found" });
  }

  return res.json({ message: "Question answered" });
});

export default router;