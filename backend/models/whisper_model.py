#backend/models/whisper_model.py
#carga del modelo Whisper
import whisper

# Cargar el modelo una vez para su reutilización
model = whisper.load_model("medium")
