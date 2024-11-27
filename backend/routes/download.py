#backend/routes/download.py
# Ruta para descargar archivos

import os
from flask import send_from_directory
from config import SRT_FOLDER, UPLOAD_FOLDER

def download_srt(filename):
    return send_from_directory(SRT_FOLDER, filename, as_attachment=True)

# Ruta para descargar archivos de audio
def download_audio(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)