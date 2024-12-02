# backend/routes/upload_files.py
# Ruta para subir archivos de audio y subtítulos

import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask import current_app
import srt
import requests

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'srt', 'wav', 'mp3', 'mp4', 'm4a'}

upload_files_bp = Blueprint('upload_files', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_srt(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        subs = list(srt.parse(file.read()))
        return [
            {"start": sub.start.total_seconds(), "end": sub.end.total_seconds(), "text": sub.content}
            for sub in subs
        ]

@upload_files_bp.route('/upload-files', methods=['POST'])
def upload_files():
    audio_file = request.files.get('audio')
    srt_file = request.files.get('srt')
    
    if not audio_file and not srt_file:
        return jsonify({"error": "No files uploaded"}), 400
    
    # Validate files
    if audio_file and not allowed_file(audio_file.filename):
        return jsonify({"error": "Invalid audio file type"}), 400
    
    if srt_file and not allowed_file(srt_file.filename):
        return jsonify({"error": "Invalid SRT file type"}), 400
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    audio_filename = None
    srt_filename = None
    
    try:
        # Handle audio file
        if audio_file:
            audio_filename = secure_filename(audio_file.filename)
            audio_path = os.path.join(UPLOAD_FOLDER, audio_filename)
            audio_file.save(audio_path)
        
        # Handle SRT file
        if srt_file:
            srt_filename = secure_filename(srt_file.filename)
            srt_path = os.path.join(UPLOAD_FOLDER, srt_filename)
            srt_file.save(srt_path)
            segments = parse_srt(srt_path)
            os.remove(srt_path)
        else:
            # Generate subtitles if only audio is provided
            if audio_filename:
                response = requests.post(
                    "http://127.0.0.1:5000/generate-subtitles",
                    files={"audio": open(audio_path, 'rb')}
                )
                if response.status_code == 200:
                    segments = response.json().get("segments", None)
                else:
                    raise Exception("Error generating subtitles")

        return jsonify({
            "audio_filename": audio_filename,
            "srt_filename": srt_filename,
            "segments": segments
        }), 200
    
    except Exception as e:
        # Clean up files if an error occurs
        if audio_file and os.path.exists(os.path.join(UPLOAD_FOLDER, audio_filename)):
            os.remove(os.path.join(UPLOAD_FOLDER, audio_filename))
        return jsonify({"error": str(e)}), 500