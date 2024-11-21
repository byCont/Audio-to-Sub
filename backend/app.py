# backend/app.py
# Archivo principal para iniciar la app

import os
from flask import Flask
from flask_cors import CORS
from routes.generate_subtitles import generate_subtitles
from routes.save_subtitles import save_subtitles
from routes.download import download_srt
from routes.upload_srt import upload_srt_bp  # Importa el Blueprint

app = Flask(__name__)
CORS(app)

# Configuración de la aplicación
app.config['UPLOAD_FOLDER'] = './uploads'

# Registrar rutas
app.add_url_rule("/generate-subtitles", view_func=generate_subtitles, methods=["POST"])
app.add_url_rule("/save-subtitles", view_func=save_subtitles, methods=["POST"])
app.add_url_rule("/download/<filename>", view_func=download_srt, methods=["GET"])
app.register_blueprint(upload_srt_bp)  # Registra la nueva ruta como Blueprint

if __name__ == "__main__":
    app.run(debug=True)

