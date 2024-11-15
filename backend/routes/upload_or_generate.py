# backend/routes/generate_subtitles.py
# Ruta para generar subtítulos
import os
from flask import request, jsonify
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, SRT_FOLDER, ALLOWED_EXTENSIONS
from utils import allowed_file, generate_srt, parse_srt
from models.whisper_model import model

def generate_subtitles():
    if "audio" not in request.files:
        return jsonify({"error": "No se encontró archivo de audio"}), 400

    file = request.files["audio"]
    if file.filename == "" or not allowed_file(file.filename, ALLOWED_EXTENSIONS):
        return jsonify({"error": "Archivo no válido"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Genera los subtítulos
    result = model.transcribe(file_path)
    os.remove(file_path)

    # Crea el archivo SRT
    srt_content = generate_srt(result["segments"])
    srt_filename = f"{os.path.splitext(filename)[0]}.srt"
    srt_path = os.path.join(SRT_FOLDER, srt_filename)
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)

    return jsonify({
        "segments": result["segments"],
        "srt_url": f"/download/{srt_filename}"
    })


def process_subtitles():
    if "file" not in request.files:
        return jsonify({"error": "No se encontró archivo"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)

    # Si el archivo es de subtítulos
    if filename.endswith('.srt'):
        file_path = os.path.join(SRT_FOLDER, filename)
        file.save(file_path)
        segments = parse_srt(file_path)
        return jsonify({
            "segments": segments,
            "srt_url": f"/download/{filename}"
        })

    # Si el archivo es de audio, usar el modelo Whisper
    elif allowed_file(filename, ALLOWED_EXTENSIONS):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        result = model.transcribe(file_path)
        os.remove(file_path)

        # Crear SRT
        srt_content = generate_srt(result["segments"])
        srt_filename = f"{os.path.splitext(filename)[0]}.srt"
        srt_path = os.path.join(SRT_FOLDER, srt_filename)
        with open(srt_path, "w", encoding="utf-8") as srt_file:
            srt_file.write(srt_content)

        return jsonify({
            "segments": result["segments"],
            "srt_url": f"/download/{srt_filename}"
        })

    return jsonify({"error": "Tipo de archivo no soportado"}), 400