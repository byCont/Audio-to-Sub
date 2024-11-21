# backend/routes/upload_srt.py
# Ruta para subir archivos SRT y editarlos
import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import srt

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'srt'}

upload_srt_bp = Blueprint('upload_srt', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_srt(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        subs = list(srt.parse(file.read()))
        return [
            {"start": sub.start.total_seconds(), "end": sub.end.total_seconds(), "text": sub.content}
            for sub in subs
        ]

@upload_srt_bp.route('/upload-srt', methods=['POST'])
def upload_srt():
    if 'srt' not in request.files:
        return jsonify({"error": "No SRT file uploaded"}), 400

    file = request.files['srt']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Crea la carpeta si no existe
        file.save(file_path)

        segments = parse_srt(file_path)
        os.remove(file_path)  # Limpia el archivo subido

        return jsonify({"segments": segments}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400
