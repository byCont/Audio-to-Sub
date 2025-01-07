# backend/app.py
# Archivo principal, con rutas y funciones FFmpeg para iniciar la app

from flask import Flask, request, jsonify, send_file
import os
import subprocess
from werkzeug.utils import secure_filename
from flask_cors import CORS
import traceback

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
    """Recibe archivos de imagen, audio y opcionalmente subtítulos para generar un video"""
    if 'image' not in request.files or 'audio' not in request.files:
        return jsonify({"error": "Archivos de imagen y audio son requeridos"}), 400

    image = request.files['image']
    audio = request.files['audio']
    subtitle = request.files.get('subtitle', None)  # Subtítulos son opcionales

    # Guardar archivos subidos
    image_filename = secure_filename(image.filename)
    audio_filename = secure_filename(audio.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
    audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
    image.save(image_path)
    audio.save(audio_path)

    subtitle_path = None
    if subtitle:
        subtitle_filename = secure_filename(subtitle.filename)
        subtitle_path = os.path.join(app.config['UPLOAD_FOLDER'], subtitle_filename)
        subtitle.save(subtitle_path)

    # Validar que el archivo de subtítulos exista y sea accesible
    if subtitle_path and not os.path.isfile(subtitle_path):
        return jsonify({"error": "El archivo de subtítulos no es válido o no existe"}), 400

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
            '-shortest'
        ]

        # Agregar subtítulos si están disponibles
        if subtitle_path:
            command.extend(['-vf', f"subtitles={subtitle_path}"])

        command.extend(['-y', output_path])

        # Ejecutar el comando y capturar salida de error
        result = subprocess.run(
            command,
            stderr=subprocess.PIPE,  # Captura los errores estándar
            stdout=subprocess.PIPE,  # Opcional, para capturar la salida estándar
            text=True                # Devuelve las salidas como cadenas de texto
        )

        # Verifica si FFmpeg devolvió un código de error
        if result.returncode != 0:
            error_message = result.stderr
            return jsonify({"error": f"FFmpeg error: {error_message}"}), 500

        return jsonify({"output_video": output_filename}), 200
    except Exception as e:
        # Captura excepciones inesperadas y devuelve una respuesta con el detalle
        error_trace = traceback.format_exc()
        return jsonify({"error": f"Error en la conversión: {str(e)}", "trace": error_trace}), 500
    

@app.route('/output/<filename>')
def get_output(filename):
    """Proporciona el archivo de video generado"""
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    return send_file(filepath, as_attachment=False)


if __name__ == '__main__':
    app.run(debug=True)
