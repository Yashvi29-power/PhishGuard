from flask import Flask, render_template, request
from src.detector import detect

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    result = score = features = None

    if request.method == "POST":
        url = request.form["url"]
        result, score, features = detect(url)

    return render_template(
        "index.html",
        result=result,
        score=score,
        features=features
    )

if __name__ == "__main__":
    app.run(debug=True)
