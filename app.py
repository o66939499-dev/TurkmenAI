
from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np

app = Flask(__name__, static_folder="static")

# Load trained TurkmenAI model
saved = joblib.load("TurkmenAI_model.pkl")

model = saved["model"]
vectorizer = saved["vectorizer"]

@app.route("/")
def home():
    return send_from_directory("static", "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Please enter some text."}), 400

    if len(text) > 5000:
        return jsonify({"error": "Text is too long. Maximum: 5000 characters."}), 400

    vector = vectorizer.transform([text])
    probabilities = model.predict_proba(vector)[0]

    best_index = int(np.argmax(probabilities))
    prediction = str(model.classes_[best_index])
    confidence = float(probabilities[best_index] * 100)

    # Short texts are treated as uncertain
    if len(text.split()) <= 2:
        return jsonify({
            "language": "Uncertain",
            "suggestion": prediction,
            "confidence": round(confidence, 2),
            "status": "Please provide a longer sentence."
        })

    if confidence < 70:
        status = "Low confidence — verify the result."
    elif confidence < 90:
        status = "Medium confidence."
    else:
        status = "High confidence."

    return jsonify({
        "language": prediction,
        "confidence": round(confidence, 2),
        "status": status
    })


if __name__ == "__main__":
    app.run(debug=True)
