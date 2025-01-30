# backend/app.py
# Archivo principal para iniciar la app

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.generate_subtitles import generate_subtitles
from routes.save_subtitles import save_subtitles
from routes.download import download_audio, download_srt
from routes.upload_srt import upload_srt_bp 
from routes.upload_files import upload_files_bp  # New import

app = Flask(__name__)
CORS(app)

# Configuración de la aplicación
app.config['UPLOAD_FOLDER'] = './uploads'

# Registrar rutas
app.add_url_rule("/generate-subtitles", view_func=generate_subtitles, methods=["POST"])
app.add_url_rule("/save-subtitles", view_func=save_subtitles, methods=["POST"])
app.add_url_rule("/download/<filename>", view_func=download_srt, methods=["GET"])
app.register_blueprint(upload_srt_bp)
app.register_blueprint(upload_files_bp)  # Register new Blueprint
# Nueva ruta para descargar audio
app.add_url_rule("/download-audio/<filename>", view_func=download_audio, methods=["GET"])

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True)
