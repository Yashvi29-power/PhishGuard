import sqlite3
import re
from flask import Flask, render_template, request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from src.detector import detect

app = Flask(__name__)
app.secret_key = "phishguard_secret_key"


# =========================
# DATABASE
# =========================
def get_db():
    conn = sqlite3.connect("database.db")
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


init_db()


# =========================
# PASSWORD VALIDATION
# =========================
def valid_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True


# =========================
# HOME / SCAN PAGE
# =========================
@app.route("/", methods=["GET", "POST"])
def index():
    if "user" not in session:
        return redirect("/login")

    result = None
    score = None

    if request.method == "POST":
        url = request.form["url"]
        result, score, _ = detect(url)

    return render_template("index.html", result=result, score=score)


# =========================
# REGISTER
# =========================
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        if not valid_password(password):
            return render_template(
                "register.html",
                error="Password must be at least 8 characters and include a letter, number, and special character."
            )

        hashed_password = generate_password_hash(password)

        try:
            db = get_db()
            db.execute(
                "INSERT INTO users (email, password) VALUES (?, ?)",
                (email, hashed_password)
            )
            db.commit()
            return redirect("/login")
        except sqlite3.IntegrityError:
            return render_template(
                "register.html",
                error="Email already registered."
            )

    return render_template("register.html")


# =========================
# LOGIN
# =========================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user and check_password_hash(user["password"], password):
            session["user"] = user["email"]
            return redirect("/")
        else:
            return render_template(
                "login.html",
                error="Invalid email or password."
            )

    return render_template("login.html")


# =========================
# LOGOUT
# =========================
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
