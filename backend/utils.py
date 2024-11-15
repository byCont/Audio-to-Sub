# backend/utils.py
# Funciones auxiliares, como `allowed_file` y `generate_srt`
from datetime import  datetime, timedelta

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def time_to_seconds(time_str):
    """
    Convierte un tiempo en formato HH:MM:SS.mmm o HH:MM:SS a segundos como float.
    Maneja errores devolviendo 0 por defecto.
    """
    # Limpiamos la cadena eliminando sufijos no válidos como `.000`
    time_str = time_str.strip().rstrip(".000")

    try:
        if ":" in time_str:
            if "." in time_str:
                dt = datetime.strptime(time_str, "%H:%M:%S.%f")
            else:
                dt = datetime.strptime(time_str, "%H:%M:%S")
            return dt.hour * 3600 + dt.minute * 60 + dt.second + dt.microsecond / 1e6
    except ValueError as e:
        print(f"Error parsing time: {time_str} -> {e}")
        # Valor predeterminado si el formato no es válido
        return 0


def generate_srt(segments):
    """
    Convierte los segmentos en formato SRT.
    """
    lines = []
    for i, segment in enumerate(segments):
        lines.append(f"{i + 1}")

        # Convertimos los tiempos de inicio y fin
        start_seconds = time_to_seconds(segment["start"])
        end_seconds = time_to_seconds(segment["end"])

        start = timedelta(seconds=start_seconds)
        end = timedelta(seconds=end_seconds)

        start_str = str(start).replace(".", ",")[:12] if "." in str(start) else str(start) + ",000"
        end_str = str(end).replace(".", ",")[:12] if "." in str(end) else str(end) + ",000"

        lines.append(f"{start_str} --> {end_str}")
        lines.append(segment["text"].strip())
        lines.append("")  # Línea vacía para separar entradas

    return "\n".join(lines)

#  función para leer y analizar archivos
def parse_srt(file_path):
    """
    Convierte un archivo SRT en segmentos.
    """
    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    segments = []
    i = 0
    while i < len(lines):
        if lines[i].strip().isdigit():
            start, end = lines[i + 1].split(" --> ")
            text = lines[i + 2].strip()
            segments.append({
                "start": start.replace(",", "."),
                "end": end.replace(",", "."),
                "text": text
            })
            i += 4
        else:
            i += 1

    return segments
