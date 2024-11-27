// frontend/src/components/FileUploader/FileUploader.jsx
// Componente para subir archivos (Audio y Subtitulos)

import { useState } from "react";
import axios from "axios";
import SubtitleEditor from "../SubtitleEditor/SubtitleEditor";
import FileInput from "./FileInput";
import ErrorMessage from "./ErrorMessage";
import UploadButton from "./UploadButton";

function FileUploader() {
    const [file, setFile] = useState(null);
    const [segments, setSegments] = useState([]);
    const [srtFile, setSrtFile] = useState(null);
    const [filename, setFilename] = useState("edited_subtitles.srt");
    const [audioFileUrl, setAudioFileUrl] = useState(null); // NEW
    const [srtUrl, setSrtUrl] = useState(null);
    const [error, setError] = useState("");
    const [selectedFileName, setSelectedFileName] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.name.split(".").pop();
            setSelectedFileName(selectedFile.name); // Actualizar el nombre del archivo seleccionado
            if (fileType === "srt") {
                setSrtFile(selectedFile);
                setFile(null); // Reset audio file selection
                setError("");
            } else if (["mp3", "wav", "mp4", "m4a"].includes(fileType)) {
                setFile(selectedFile);
                setSrtFile(null); // Reset .srt file selection
                setError("");
            } else {
                setError("Formato no compatible. Solo se aceptan archivos de audio (.mp3, .wav, .mp4, .m4a) y subtítulos (.srt).");
                setSelectedFileName(""); // Limpiar el nombre si hay error
            }
        }
    };

    const handleUpload = async () => {
        if (!file && !srtFile) {
            setError("Por favor, selecciona un archivo de audio o subtítulos.");
            return;
        }

        const formData = new FormData();
        try {
            if (file) {
                formData.append("audio", file);

                const response = await axios.post("http://127.0.0.1:5000/generate-subtitles", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                setSegments(response.data.segments);
                setAudioFileUrl(URL.createObjectURL(file)); // NEW
                setSrtUrl(`http://127.0.0.1:5000${response.data.srt_url}`);
                setFilename(`${file.name.split(".")[0]}_edited.srt`);
                setError("");
            } else if (srtFile) {
                formData.append("srt", srtFile);

                const response = await axios.post("http://127.0.0.1:5000/upload-srt", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                setSegments(response.data.segments);
                setFilename(srtFile.name);
                setError("");
            }
        } catch (error) {
            console.error("Error durante la carga del archivo:", error);
            setError("Hubo un problema al procesar el archivo. Intenta nuevamente.");
        }
    };

    const handleSave = async (editedSegments) => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/save-subtitles", {
                segments: editedSegments,
                filename,
            });

            setSrtUrl(`http://127.0.0.1:5000${response.data.srt_url}`);
            alert("Subtítulos guardados y disponibles para descargar.");
        } catch (error) {
            console.error("Error al guardar los subtítulos editados:", error);
            setError("No se pudo guardar el archivo. Intenta nuevamente.");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg space-y-6">
            <h1 className="text-2xl font-bold text-center">Sube un archivo</h1>
            <p className="text-center text-gray-400">
                Puedes subir un archivo de audio para generar subtítulos automáticamente o cargar un archivo <code>.srt</code> para editarlo.
            </p>
            <ErrorMessage error={error} />
            <FileInput
                onFileChange={handleFileChange}
                selectedFileName={selectedFileName}
                fileHelpText="Archivos soportados: .mp3, .wav, .mp4, .m4a para audio y .srt para subtítulos."
            />
            <UploadButton onUpload={handleUpload} />
            {segments.length > 0 && <SubtitleEditor segments={segments} audioFileUrl={audioFileUrl} onSave={handleSave} />}
            {srtUrl && (
                <div className="text-center mt-4">
                    <a
                        href={srtUrl}
                        download={filename}
                        className="inline-block py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                        Descargar archivo .srt
                    </a>
                </div>
            )}
        </div>
    );
}

export default FileUploader;

