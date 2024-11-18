# backend/utils.py
# Funciones auxiliares para la generación de subtítulos

from datetime import timedelta

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def seconds_to_srt_format(seconds):
    """
    Convierte segundos al formato HH:MM:SS,mmm requerido para SRT.
    """
    whole_seconds = int(float(seconds))
    milliseconds = int((float(seconds) - whole_seconds) * 1000)
    time_obj = timedelta(seconds=whole_seconds)
    
    # Asegurarse de que el formato tenga siempre HH:MM:SS
    time_str = str(time_obj)
    if len(time_str.split(':')) == 2:
        time_str = f"00:{time_str}"
    elif len(time_str.split(':')) == 1:
        time_str = f"00:00:{time_str}"
    
    return f"{time_str},{milliseconds:03d}"

def generate_srt(segments):
    """
    Convierte los segmentos en formato SRT, eliminando espacios en blanco innecesarios
    y asegurando un formato consistente.
    
    Args:
        segments (list): Lista de diccionarios con las claves 'start', 'end' y 'text'
    
    Returns:
        str: Contenido del archivo SRT formateado
    """
    srt_content = []
    previous_end = 0
    
    for i, segment in enumerate(segments, start=1):
        # Obtener y limpiar el texto
        text = segment["text"].replace('\n', ' ').strip()
        
        # Si no hay texto significativo después de la limpieza, continuar con el siguiente segmento
        if not text or text.isspace():
            continue
            
        # Convertir tiempos a formato SRT
        start_time = float(segment["start"])
        end_time = float(segment["end"])
        
        # Ajustar tiempos para evitar solapamientos y espacios vacíos
        if start_time < previous_end:
            start_time = previous_end
        
        # Solo agregar el segmento si tiene una duración válida
        if end_time > start_time:
            start_str = seconds_to_srt_format(start_time)
            end_str = seconds_to_srt_format(end_time)
            
            srt_content.append(f"{i}")
            srt_content.append(f"{start_str} --> {end_str}")
            srt_content.append(text)
            srt_content.append("")  # Línea vacía para separar entradas
            
            previous_end = end_time
    
    # Eliminar la última línea vacía si existe
    if srt_content and not srt_content[-1]:
        srt_content.pop()
    
    return "\n".join(srt_content)