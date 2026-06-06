
"""Setup script for the Online Exam & Result Portal.

Creates a SQLite database (exam_portal.db) in the project directory and
initializes required tables. A default admin user with username 'admin' is
created if it does not already exist. Password for the default admin is
"admin" (SHA-256 hashed). This script is idempotent.
"""

from pathlib import Path
import sqlite3
import hashlib
import json
import sys


DB_NAME = "exam_portal.db"


def sha256(text: str) -> str:
	return hashlib.sha256(text.encode("utf-8")).hexdigest()


def init_db(db_path: Path):
	conn = sqlite3.connect(str(db_path))
	cur = conn.cursor()

	# Users table
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)

	# Exams table
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS exams (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
		"""
	)

	# Questions table
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS questions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			exam_id INTEGER NOT NULL,
			question_text TEXT NOT NULL,
			choices TEXT,
			correct_choice TEXT,
			FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
		)
		"""
	)

	# Results table
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS results (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			exam_id INTEGER NOT NULL,
			score REAL,
			taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id),
			FOREIGN KEY(exam_id) REFERENCES exams(id)
		)
		"""
	)

	conn.commit()
	return conn


def ensure_admin(conn: sqlite3.Connection, username: str = "admin", password: str = "admin"):
	cur = conn.cursor()
	cur.execute("SELECT id FROM users WHERE username = ?", (username,))
	row = cur.fetchone()
	if row:
		return False
	pwd_hash = sha256(password)
	cur.execute(
		"INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
		(username, pwd_hash, "admin"),
	)
	conn.commit()
	return True


def main():
	base = Path(__file__).parent
	db_path = base / DB_NAME

	try:
		conn = init_db(db_path)
	except Exception as e:
		print(f"Failed to create or open database: {e}")
		sys.exit(1)

	created = ensure_admin(conn)
	conn.close()

	print(f"Database initialized at: {db_path}")
	if created:
		print("Default admin user created: username='admin' password='admin'")
	else:
		print("Admin user already exists")


if __name__ == "__main__":
	main()

