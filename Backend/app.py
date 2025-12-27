from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import predict_text, speech_to_text
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/analyze", methods=["POST"])
def analyze():
    print("REQUEST FILES:", request.files)
   

    # CASE 1: AUDIO INPUT
    if "audio" in request.files:
        audio = request.files["audio"]
        audio_path = os.path.join(UPLOAD_FOLDER, audio.filename)
        audio.save(audio_path)

        text = speech_to_text(audio_path)
        if not text:
             return jsonify({
                 "error": "Audio could not be transcribed. Please upload clear audio.",
                 "transcribed_text": "",
                "scores": {},
                "binary_results": {},
                "confidence": 0
             }), 200
        scores = predict_text(text)

        binary_results = {k: v >= 0.5 for k, v in scores.items()}
        confidence = round(max(scores.values()) * 100, 2)

        return jsonify({
            "input_type": "audio",
            "transcribed_text": text,
            "scores": scores,
            "binary_results": binary_results,
            "confidence": confidence
        })

    # CASE 2: TEXT INPUT
    data = request.get_json()
    if data and "text" in data:
        text = data["text"]
        scores = predict_text(text)

        binary_results = {k: v >= 0.5 for k, v in scores.items()}
        confidence = round(max(scores.values()) * 100, 2)

        return jsonify({
            "input_type": "text",
            "text": text,
            "scores": scores,
            "binary_results": binary_results,
            "confidence": confidence
        })

    return jsonify({"error": "No input provided"}), 400


if __name__ == "__main__":
    app.run(debug=True)
