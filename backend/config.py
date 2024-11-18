#backend/config.py
# Configuración de la aplicación

import os

UPLOAD_FOLDER = "uploads"
SRT_FOLDER = "subtitles"
ALLOWED_EXTENSIONS = {"wav", "mp3", "mp4", "m4a"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SRT_FOLDER, exist_ok=True)
