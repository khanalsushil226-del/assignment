from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
CORS(app)

def get_database():
    connection = sqlite3.connect("assignments.db")
    connection.row_factory = sqlite3.Row
    return connection

@app.route("/")
def home():
    return jsonify({
        "message": "Assignments backend is running"
    })

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Invalid request data"
        }), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not username or not email or not password or not role:
        return jsonify({
            "message": "All fields are required"
        }), 400

    if role not in ["student", "teacher"]:
        return jsonify({
            "message": "Invalid role selected"
        }), 400

    if len(password) < 6:
        return jsonify({
            "message": "Password must contain at least 6 characters"
        }), 400

    connection = get_database()
    cursor = connection.cursor()

    existing_username = cursor.execute(
        "SELECT id FROM students WHERE username = ?",
        (username,)
    ).fetchone()

    if existing_username:
        connection.close()

        return jsonify({
            "message": "Username already exists"
        }), 409

    existing_email = cursor.execute(
        "SELECT id FROM students WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_email:
        connection.close()

        return jsonify({
            "message": "Email already exists"
        }), 409

    hashed_password = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO students (username, email, password, role)
        VALUES (?, ?, ?, ?)
        """,
        (username, email, hashed_password, role)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Registration successful"
    }), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Invalid request data"
        }), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    connection = get_database()
    cursor = connection.cursor()

    user = cursor.execute(
        """
        SELECT id, username, email, password, role
        FROM students
        WHERE username = ?
        """,
        (username,)
    ).fetchone()

    connection.close()

    if not user:
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200
@app.route("/assignments", methods=["POST"])
def create_assignment():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Invalid request data"
        }), 400

    title = data.get("title", "").strip()
    subject = data.get("subject", "").strip()
    description = data.get("description", "").strip()
    due_date = data.get("due_date", "").strip()
    teacher_id = data.get("teacher_id")

    if not title or not subject or not due_date or not teacher_id:
        return jsonify({
            "message": "Title, subject, due date, and teacher ID are required"
        }), 400

    connection = get_database()
    cursor = connection.cursor()

    teacher = cursor.execute(
        """
        SELECT id FROM students
        WHERE id = ? AND role = 'teacher'
        """,
        (teacher_id,)
    ).fetchone()

    if not teacher:
        connection.close()

        return jsonify({
            "message": "Only teachers can create assignments"
        }), 403

    cursor.execute(
        """
        INSERT INTO assignments
        (title, subject, description, due_date, teacher_id)
        VALUES (?, ?, ?, ?, ?)
        """,
        (title, subject, description, due_date, teacher_id)
    )

    connection.commit()
    assignment_id = cursor.lastrowid
    connection.close()

    return jsonify({
        "message": "Assignment created successfully",
        "assignment_id": assignment_id
    }), 201
if __name__ == "__main__":
    app.run(debug=True, port=5001)