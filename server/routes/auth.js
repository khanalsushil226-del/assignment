import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken, requireAuth } from "../auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { username, email, password, role } = req.body || {};

  const cleanUsername = (username || "").toString().trim();
  const cleanEmail = (email || "").toString().trim().toLowerCase();
  const cleanRole = (role || "").toString().trim().toLowerCase();

  if (!cleanUsername || !cleanEmail || !password || !cleanRole) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["student", "teacher"].includes(cleanRole)) {
    return res.status(400).json({ message: "Invalid role selected" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({
      message: "Password must contain at least 6 characters",
    });
  }

  const duplicateUsername = db
    .prepare("SELECT id FROM students WHERE username = ?")
    .get(cleanUsername);

  if (duplicateUsername) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const duplicateEmail = db
    .prepare("SELECT id FROM students WHERE email = ?")
    .get(cleanEmail);

  if (duplicateEmail) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const result = db
    .prepare(
      "INSERT INTO students (username, email, password, role) VALUES (?, ?, ?, ?)"
    )
    .run(cleanUsername, cleanEmail, passwordHash, cleanRole);

  const user = {
    id: result.lastInsertRowid,
    username: cleanUsername,
    role: cleanRole,
  };

  const token = signToken(user);

  return res.status(201).json({
    message: "Registration successful",
    token,
    user,
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  const cleanUsername = (username || "").toString().trim();
  const cleanPassword = String(password || "");

  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  const user = db
    .prepare("SELECT * FROM students WHERE username = ?")
    .get(cleanUsername);

  if (!user || !bcrypt.compareSync(cleanPassword, user.password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = signToken(user);

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, username, email, role, created_at FROM students WHERE id = ?")
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});

export default router;