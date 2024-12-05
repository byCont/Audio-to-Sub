# backend/app.py
# Archivo principal, con rutas y funciones FFmpeg para iniciar la app

from flask import Flask, request, jsonify, send_file
import os
import subprocess
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde el frontend
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Crear carpetas necesarias
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_files():
    """Recibe archivos de imagen y audio y devuelve progreso"""
    if 'image' not in request.files or 'audio' not in request.files:
        return jsonify({"error": "Archivos de imagen y audio son requeridos"}), 400

    image = request.files['image']
    audio = request.files['audio']

    # Guardar archivos subidos
    image_filename = secure_filename(image.filename)
    audio_filename = secure_filename(audio.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
    audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
    image.save(image_path)
    audio.save(audio_path)

    # Generar video usando FFmpeg
    output_filename = f"{os.path.splitext(image_filename)[0]}_{os.path.splitext(audio_filename)[0]}.mp4"
    output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)

    try:
        # Comando FFmpeg
        command = [
            'ffmpeg',
            '-loop', '1',
            '-i', image_path,
            '-i', audio_path,
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-y',
            output_path
        ]
        subprocess.run(command, check=True)
        return jsonify({"output_video": output_filename}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Error en la conversión: {e}"}), 500

@app.route('/output/<filename>')
def get_output(filename):
    """Proporciona el archivo de video generado"""
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    return send_file(filepath, as_attachment=False)


if __name__ == '__main__':
    app.run(debug=True)
