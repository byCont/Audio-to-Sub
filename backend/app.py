# backend/app.py
import os
from flask import Flask, request, jsonify, send_from_directory
import whisper
from werkzeug.utils import secure_filename
from flask_cors import CORS
from routes.generate_subtitles import generate_subtitles
from routes.save_subtitles import save_subtitles
from routes.download import download_srt

app = Flask(__name__)
CORS(app)

# Rutas
app.add_url_rule("/generate-subtitles", view_func=generate_subtitles, methods=["POST"])
app.add_url_rule("/save-subtitles", view_func=save_subtitles, methods=["POST"])
app.add_url_rule("/download/<filename>", view_func=download_srt, methods=["GET"])

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(SRT_FOLDER, exist_ok=True)
    app.run(debug=True)
