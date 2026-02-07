import sqlite3
from flask import Flask, render_template, request, redirect, session
from src.detector import detect

app = Flask(__name__)
app.secret_key = "phishguard_secret_key"


@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    score = None

    if request.method == "POST":
        url = request.form["url"]
        result, score, _ = detect(url)

    return render_template("index.html", result=result, score=score)


@app.route("/login")
def login():
    return "<h2>Login page coming soon</h2>"


@app.route("/register")
def register():
    return "<h2>Register page coming soon</h2>"


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
