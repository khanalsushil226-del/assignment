import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.patch("/", requireAuth, (req, res) => {
  const { username, email } = req.body || {};

  const cleanUsername = (username || "").toString().trim();
  const cleanEmail = (email || "").toString().trim().toLowerCase();

  const current = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.user.id);

  if (!current) {
    return res.status(404).json({ message: "User not found" });
  }

  const newUsername = cleanUsername || current.username;
  const newEmail = cleanEmail || current.email;

  if (cleanUsername) {
    const taken = db
      .prepare("SELECT id FROM students WHERE username = ? AND id != ?")
      .get(cleanUsername, req.user.id);

    if (taken) {
      return res.status(409).json({ message: "Username already exists" });
    }
  }

  if (cleanEmail) {
    const taken = db
      .prepare("SELECT id FROM students WHERE email = ? AND id != ?")
      .get(cleanEmail, req.user.id);

    if (taken) {
      return res.status(409).json({ message: "Email already exists" });
    }
  }

  db.prepare("UPDATE students SET username = ?, email = ? WHERE id = ?").run(
    newUsername,
    newEmail,
    req.user.id
  );

  return res.json({
    message: "Profile updated successfully",
    user: { id: req.user.id, username: newUsername, email: newEmail },
  });
});

router.patch("/password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({
      message: "Password must contain at least 6 characters",
    });
  }

  const user = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.user.id);

  if (!user || !bcrypt.compareSync(String(currentPassword), user.password)) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  db.prepare("UPDATE students SET password = ? WHERE id = ?").run(
    bcrypt.hashSync(String(newPassword), 10),
    req.user.id
  );

  return res.json({ message: "Password updated successfully" });
});

export default router;