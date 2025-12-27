import torch
import whisper
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = r"C:\Users\somal\Desktop\FinalProject-CyberBullying\final_deberta_v3_large"

print("Loading model from:", MODEL_PATH)

# Load DeBERTa
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

# Load Whisper (small is enough for project)
whisper_model = whisper.load_model("small")

LABELS = [
    "toxic",
    "severe_toxic",
    "obscene",
    "threat",
    "insult",
    "identity_hate"
]

import os
import subprocess

whisper_model = whisper.load_model("base")

def convert_to_wav(input_path):
    output_path = input_path.replace(".mp3", "_converted.wav")

    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",          # mono
        "-ar", "16000",      # 16kHz
        output_path
    ]

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_path


def speech_to_text(audio_path):
    if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
        print("❌ Empty audio file")
        return ""

    try:
        # 🔥 CONVERT FIRST
        wav_path = convert_to_wav(audio_path)

        result = whisper_model.transcribe(wav_path)
        text = result.get("text", "").strip()

        print("🎧 Transcription:", text)

        return text

    except Exception as e:
        print("❌ Whisper failed:", e)
        return ""


def predict_text(text):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.sigmoid(outputs.logits).squeeze().tolist()

    return dict(zip(LABELS, probs))
