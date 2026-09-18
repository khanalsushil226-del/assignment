import sqlite3

def create_database():
    connection = sqlite3.connect("assignments.db")
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
        )
    """)

    columns = cursor.execute("PRAGMA table_info(students)").fetchall()
    column_names = [column[1] for column in columns]

    if "email" not in column_names:
        cursor.execute("ALTER TABLE students ADD COLUMN email TEXT")

    connection.commit()
    connection.close()

if __name__ == "__main__":
    create_database()
    print("Database created successfully.")