import os
import re
import sqlite3
from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from src.detector import detect

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)
app.secret_key = "phishguard_secret_key"

# =========================
# DATABASE CONFIG
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    db.commit()
    db.close()


init_db()

# =========================
# PASSWORD VALIDATION
# =========================
def valid_password(password):
    return (
        len(password) >= 8
        and re.search(r"[A-Za-z]", password)
        and re.search(r"\d", password)
        and re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    )


# =========================
# PUBLIC SCAN PAGE
# =========================
@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    score = None

    if request.method == "POST":
        url = request.form["url"]
        result, score, _ = detect(url)

    return render_template(
        "index.html",
        result=result,
        score=score,
        user=session.get("user")
    )


# =========================
# REGISTER
# =========================
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["email"].strip()
        password = request.form["password"]

        if not valid_password(password):
            return render_template(
                "register.html",
                error="Password must be at least 8 characters and include a letter, number, and special character."
            )

        hashed_password = generate_p
