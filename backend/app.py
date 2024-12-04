# backend/app.py
# Archivo principal

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import subprocess
import uuid

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
TEMP_FOLDER = "temp"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Ruta para subir archivos
@app.route('/upload', methods=['POST'])
def upload_files():
    if 'audio' not in request.files or 'image' not in request.files:
        return jsonify({"error": "Audio and image files are required"}), 400

    audio_file = request.files['audio']
    image_file = request.files['image']
    srt_file = request.files.get('srt')  # Los subtítulos son opcionales

    # Validación de los archivos
    if not (audio_file.filename.endswith('.mp3') or audio_file.filename.endswith('.wav')):
        return jsonify({"error": "Invalid audio file format"}), 400

    if not (image_file.filename.endswith('.jpg') or image_file.filename.endswith('.png')):
        return jsonify({"error": "Invalid image file format"}), 400

    if srt_file and not srt_file.filename.endswith('.srt'):
        return jsonify({"error": "Invalid subtitle file format"}), 400

    # Guardar los archivos
    audio_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}{os.path.splitext(audio_file.filename)[1]}")
    image_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}{os.path.splitext(image_file.filename)[1]}")
    srt_path = None
    if srt_file:
        srt_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.srt")

    audio_file.save(audio_path)
    image_file.save(image_path)
    if srt_file:
        srt_file.save(srt_path)

    # Generar el video
    try:
        output_path = generate_video(audio_path, image_path, srt_path)
        return jsonify({"message": "Video generated successfully", "output_url": f"/download/{os.path.basename(output_path)}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Función para generar el video con FFmpeg
def generate_video(audio_path, image_path, srt_path=None):
    output_path = os.path.join(OUTPUT_FOLDER, f"{uuid.uuid4()}.mp4")
    
    # Construir el comando de FFmpeg
    ffmpeg_command = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", image_path, "-i", audio_path,
        "-c:v", "libx264", "-c:a", "aac", "-b:a", "299k",
        "-shortest"
    ]

    # Agregar subtítulos si existen
    if srt_path:
        ffmpeg_command.extend([
            "-vf", f"subtitles={srt_path}:force_style='FontSize=36,Alignment=2'"
        ])
    
    # Agregar la salida
    ffmpeg_command.append(output_path)

    # Ejecutar FFmpeg
    subprocess.run(ffmpeg_command, check=True)
    return output_path

# Ruta para descargar el video generado
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)

# Ruta base para probar el servidor
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Backend is running!"})

# Iniciar el servidor
if __name__ == '__main__':
    app.run(debug=True)
