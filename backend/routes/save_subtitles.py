# backend/routes/save_subtitles.py
# Ruta para guardar subtítulos editados

import os
from flask import request, jsonify
from config import SRT_FOLDER
from utils import generate_srt

def save_subtitles():
    data = request.get_json()
    segments = data.get("segments")
    filename = data.get("filename", "edited_subtitles.srt")
    
    # Genera el archivo SRT con los datos editados
    srt_content = generate_srt(segments)
    srt_path = os.path.join(SRT_FOLDER, filename)
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)

    return jsonify({"srt_url": f"/download/{filename}"})
