from datetime import timedelta

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def generate_srt(segments):
    """
    Convierte los segmentos en formato SRT.
    """
    lines = []
    for i, segment in enumerate(segments):
        lines.append(f"{i + 1}")
        
        start = timedelta(seconds=float(segment["start"]))
        end = timedelta(seconds=float(segment["end"]))
        start_str = str(start).replace(".", ",")[:12] if "." in str(start) else str(start) + ",000"
        end_str = str(end).replace(".", ",")[:12] if "." in str(end) else str(end) + ",000"
        
        lines.append(f"{start_str} --> {end_str}")
        lines.append(segment["text"].strip())
        lines.append("")  # Línea vacía para separar entradas

    return "\n".join(lines)
