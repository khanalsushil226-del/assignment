from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash
import sqlite3

app = Flask(__name__)

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

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "message": "Password must contain at least 6 characters"
        }), 400

    connection = get_database()
    cursor = connection.cursor()

    existing_student = cursor.execute(
        "SELECT id FROM students WHERE username = ?",
        (username,)
    ).fetchone()

    if existing_student:
        connection.close()

        return jsonify({
            "message": "Username already exists"
        }), 409

    hashed_password = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO students (username, password, role)
        VALUES (?, ?, ?)
        """,
        (username, hashed_password, "student")
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Registration successful"
    }), 201

if __name__ == "__main__":
    app.run(debug=True)