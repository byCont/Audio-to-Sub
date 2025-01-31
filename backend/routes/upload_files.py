# backend/routes/upload_files.py
# Ruta para subir archivos de audio y subtítulos
import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask import current_app
import srt
import requests

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'srt', 'lrc', 'wav', 'mp3', 'mp4', 'm4a'}  # Agregamos 'lrc'

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

def convert_lrc_to_srt(file_path):
    """
    Convierte un archivo .lrc en un archivo .srt temporal.
    Aplica un delay de 1 segundo a todos los tiempos.
    """
    entries = []  # Almacenar todos los subtítulos temporalmente
    with open(file_path, 'r', encoding='utf-8') as f_in:
        for line in f_in:
            line = line.strip()
            if line.startswith('['):
                end_bracket = line.find(']')
                if end_bracket != -1:
                    # Extraer tiempo y texto
                    time_str = line[1:end_bracket]
                    text = line[end_bracket+1:].lstrip()  # Eliminar espacios solo al inicio del texto
                    # Validar si el tiempo tiene formato correcto (ej: mm:ss.xx)
                    if ":" in time_str and "." in time_str:  # Filtra solo tiempos válidos
                        try:
                            start_time = convert_time_lrc(time_str)
                            # Aplicar delay de 1 segundo
                            start_time -= 1
                            entries.append((start_time, text))
                        except Exception as e:
                            print(f"Formato de tiempo inválido en línea: {line} - Error: {e}")  # Debug opcional
    
    # Crear subtítulos SRT
    subtitles = []
    for i, (start_time, text) in enumerate(entries):
        if i < len(entries) - 1:
            next_start = entries[i + 1][0]
            time_diff = next_start - start_time
            end_time = next_start if time_diff < 7 else start_time + 5
        else:
            end_time = start_time + 8
        
        # Aplicar delay de 1 segundo al tiempo de finalización
        # end_time -= 1
        
        subtitle = srt.Subtitle(
            index=i + 1,
            start=srt.timedelta(seconds=start_time),
            end=srt.timedelta(seconds=end_time),
            content=text
        )
        subtitles.append(subtitle)
    
    # Guardar el archivo SRT temporal
    temp_srt_path = file_path.replace('.lrc', '.srt')
    with open(temp_srt_path, 'w', encoding='utf-8') as f_out:
        f_out.write(srt.compose(subtitles))
    
    return temp_srt_path

def convert_time_lrc(time_str):
    """
    Convierte un tiempo en formato LRC (mm:ss.xx) a segundos.
    """
    minutes, seconds = time_str.split(':')
    seconds, milliseconds = seconds.split('.')
    total_seconds = int(minutes) * 60 + int(seconds) + int(milliseconds) / 100
    return total_seconds

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
        return jsonify({"error": "Invalid SRT/LRC file type"}), 400
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    audio_filename = None
    srt_filename = None
    
    try:
        # Handle audio file
        if audio_file:
            audio_filename = secure_filename(audio_file.filename)
            audio_path = os.path.join(UPLOAD_FOLDER, audio_filename)
            audio_file.save(audio_path)
        
        # Handle SRT/LRC file
        if srt_file:
            srt_filename = secure_filename(srt_file.filename)
            srt_path = os.path.join(UPLOAD_FOLDER, srt_filename)
            srt_file.save(srt_path)
            
            # Si es un archivo .lrc, convertirlo a .srt
            if srt_filename.endswith('.lrc'):
                srt_path = convert_lrc_to_srt(srt_path)
                srt_filename = srt_filename.replace('.lrc', '.srt')
            
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
        if srt_file and os.path.exists(os.path.join(UPLOAD_FOLDER, srt_filename)):
            os.remove(os.path.join(UPLOAD_FOLDER, srt_filename))
        return jsonify({"error": str(e)}), 500