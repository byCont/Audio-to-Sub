# backend/app.py
import os
from flask import Flask, request, jsonify, send_from_directory
import whisper
from werkzeug.utils import secure_filename
from flask_cors import CORS
from datetime import timedelta

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

def generate_srt(transcription):
    """
    Convierte la transcripción en formato SRT.
    """
    lines = []
    for i, segment in enumerate(transcription["segments"]):
        # Número de secuencia
        lines.append(f"{i + 1}")
        
        # Tiempo de inicio y fin en formato SRT (hh:mm:ss,mss)
        start = timedelta(seconds=int(segment["start"]))
        end = timedelta(seconds=int(segment["end"]))
        start_str = str(start)
        end_str = str(end)
        
        # Ajuste de formato
        if "." in start_str:
            start_str = start_str.replace(".", ",")[:12]  # hh:mm:ss,mmm
        else:
            start_str += ",000"
        if "." in end_str:
            end_str = end_str.replace(".", ",")[:12]
        else:
            end_str += ",000"
        
        # Línea de tiempo
        lines.append(f"{start_str} --> {end_str}")
        
        # Texto del segmento
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
    os.remove(file_path)  # Limpia el archivo de audio subido

    # Genera el archivo .srt
    srt_content = generate_srt(result)
    srt_filename = f"{os.path.splitext(filename)[0]}.srt"
    srt_path = os.path.join(app.config["SRT_FOLDER"], srt_filename)
    with open(srt_path, "w", encoding="utf-8") as srt_file:
        srt_file.write(srt_content)

    # Devuelve la transcripción y el enlace de descarga del archivo SRT
    return jsonify({
        "subtitles": result["text"],
        "srt_url": f"/download/{srt_filename}"
    })

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
