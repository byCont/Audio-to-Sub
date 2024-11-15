# backend/app.py
import os
from flask import Flask, request, jsonify, send_from_directory
import whisper
from werkzeug.utils import secure_filename
from flask_cors import CORS
from datetime import timedelta
import json

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = "uploads"
SRT_FOLDER = "subtitles"
ALLOWED_EXTENSIONS = {"wav", "mp3", "mp4", "m4a"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SRT_FOLDER"] = SRT_FOLDER
model = whisper.load_model("medium")  # Carga el modelo "medium" de Whisper

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_srt(segments):
    """
    Convierte los segmentos en formato SRT.
    """
    lines = []
    for i, segment in enumerate(segments):
        lines.append(f"{i + 1}")
        
        start = timedelta(seconds=float(segment["start"]))
        end = timedelta(seconds=float(segment["end"]))
        start_str = str(start).replace(".", ",")[:12] if "." in str(start) else str(start) + ",000"
        end_str = str(end).replace(".", ",")[:12] if "." in str(end) else str(end) + ",000"
        
        lines.append(f"{start_str} --> {end_str}")
        lines.append(segment["text"].strip())
        lines.append("")  # Línea vacía para separar entradas

    return "\n".join(lines)

@app.route("/generate-subtitles", methods=["POST"])
def generate_subtitles():
    if "audio" not in request.files:
        return jsonify({"error": "No se encontró archivo de audio"}), 400

    file = request.files["audio"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Archivo no válido"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    # Genera los subtítulos
    result = model.transcribe(file_path)
    os.remove(file_path)

    # Crea el archivo SRT
    srt_content = generate_srt(result["segments"])
    srt_filename = f"{os.path.splitext(filename)[0]}.srt"
    srt_path = os.path.join(app.config["SRT_FOLDER"], srt_filename)
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)

    # Retorna los segmentos de subtítulos en lugar de texto completo
    return jsonify({
        "segments": result["segments"],  # Lista de segmentos de subtítulos
        "srt_url": f"/download/{srt_filename}"
    })

@app.route("/save-subtitles", methods=["POST"])
def save_subtitles():
    data = request.get_json()
    segments = data.get("segments")
    filename = data.get("filename", "edited_subtitles.srt")
    
    # Genera el archivo SRT con los datos editados
    srt_content = generate_srt(segments)
    srt_path = os.path.join(app.config["SRT_FOLDER"], filename)
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)

    # Devuelve el enlace de descarga del archivo SRT editado
    return jsonify({"srt_url": f"/download/{filename}"})

@app.route("/download/<filename>")
def download_srt(filename):
    """
    Ruta para descargar el archivo SRT.
    """
    return send_from_directory(app.config["SRT_FOLDER"], filename, as_attachment=True)

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(SRT_FOLDER, exist_ok=True)
    app.run(debug=True)
