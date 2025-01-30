# Audio-to-Subtitulos 📽️🎧

## Resumen del Proyecto

Audio-to-Subtitulos es una aplicación web que utiliza el modelo **Whisper de OpenAI** para transcribir audios a texto y generar subtítulos automáticamente. El backend está construido con **Flask** en Python, mientras que el frontend está desarrollado en **React**. Esta herramienta permite a los usuarios subir archivos de audio, generar subtítulos, editarlos y descargarlos en formato `.srt`.

Las principales funcionalidades son:
- **Subir archivos de audio** 🎶: Los usuarios pueden cargar archivos en formatos como `.wav`, `.mp3`, `.mp4` y `.m4a`.
- **Generar subtítulos automáticamente** 📝: Utilizando el modelo Whisper de OpenAI, el backend convierte el audio en texto y genera un archivo `.srt`.
- **Editar subtítulos** ✏️: Los usuarios pueden modificar los subtítulos generados, ajustando el texto y los tiempos de inicio/fin.
- **Descargar subtítulos** ⬇️: Después de realizar cambios en el editor, los usuarios pueden descargar el archivo `.srt` actualizado.

## Funcionalidades del Proyecto

### Backend (Flask)
- **app.py**: Archivo principal de Flask que gestiona la carga de archivos, la generación de subtítulos y la descarga de archivos `.srt`.
- **whisper_model.py**: Carga y utiliza el modelo Whisper de OpenAI para realizar la transcripción de audio a texto.
- **routes**: Varias rutas para manejar la carga de archivos, la generación y la edición de subtítulos.
  - **generate_subtitles.py**: Ruta para generar subtítulos a partir del archivo de audio.
  - **save_subtitles.py**: Ruta para guardar los subtítulos editados.
  - **download.py**: Ruta para permitir la descarga del archivo `.srt`.
  - **upload_srt.py**: Ruta para subir un archivo `.srt` para edición.
- **utils.py**: Funciones auxiliares como `allowed_file` (para validar los tipos de archivo) y `generate_srt` (para crear el archivo `.srt`).
- **models/**: Contiene el archivo `whisper_model.py` que carga el modelo Whisper para convertir audio en texto.
- **uploads/**: Carpeta para almacenar archivos de audio subidos temporalmente.
- **subtitles/**: Carpeta para almacenar los archivos `.srt` generados.

### Frontend (React)
- **FileUploader**: Componente para cargar archivos de audio al backend y recibir los subtítulos generados.
  - **FileUploader.jsx**: Componente principal para manejar la carga de archivos.
  - **FileInput.jsx**: Componente para seleccionar archivos de audio.
  - **ErrorMessage.jsx**: Muestra los errores durante el proceso de carga.
  - **UploadButton.jsx**: Botón para iniciar la carga del archivo.

- **SubtitleEditor**: Componente para editar los subtítulos generados.
  - **SubtitleEditor.jsx**: Componente principal para la edición de subtítulos.
  - **SubtitleSegment.jsx**: Manejo de un segmento individual de subtítulos.
  - **ErrorAlert.jsx**: Muestra errores relacionados con los subtítulos.
  - **AudioSubtitleDisplay.jsx**: Reproduce el audio y muestra los subtítulos sincronizados en la línea de tiempo.

- **utils/timeUtils.js**: Funciones para manejar el formato de tiempo y validaciones de los subtítulos.
- **App.jsx**: Entrada principal de la aplicación.
- **index.css**: Estilos generales para la aplicación.
- **main.jsx**: Punto de entrada principal de React.
- **public/**: Contiene archivos estáticos como `index.html` y el icono de la aplicación.

## Requisitos

### Backend
- Python 3.x
- Flask
- OpenAI's Whisper
- Otros paquetes necesarios listados en `requirements.txt`

### Frontend
- Node.js
- React
- Otros paquetes necesarios listados en `package.json`

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/byCont/Audio-to-Sub
   cd Audio-to-Sub
