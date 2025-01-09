// frontend/src/components/FileUploader/FileUploader.jsx
// Componente para subir archivos (Audio y Subtitulos)

import { useState } from "react";
import axios from "axios";
import SubtitleEditor from "../SubtitleEditor/SubtitleEditor";
import FileInput from "./FileInput";
import ErrorMessage from "./ErrorMessage";
import UploadButton from "./UploadButton";

function FileUploader() {
    const [audioFile, setAudioFile] = useState(null);
    const [srtFile, setSrtFile] = useState(null);
    const [segments, setSegments] = useState([]);
    const [filename, setFilename] = useState("edited_subtitles.srt");
    const [audioFileUrl, setAudioFileUrl] = useState(null);
    const [srtUrl, setSrtUrl] = useState(null);
    const [error, setError] = useState("");
    const [selectedAudioFileName, setSelectedAudioFileName] = useState("");
    const [selectedSrtFileName, setSelectedSrtFileName] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Nuevo estado

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.name.split(".").pop().toLowerCase();
            
            if (fileType === "srt") {
                setSrtFile(selectedFile);
                setSelectedSrtFileName(selectedFile.name);
                setSelectedAudioFileName("");  // Reset audio file
                setError("");
            } else if (["mp3", "wav", "mp4", "m4a"].includes(fileType)) {
                setAudioFile(selectedFile);
                setSelectedAudioFileName(selectedFile.name);
                setSelectedSrtFileName("");  // Reset SRT file
                setError("");
            } else {
                setError("Formato no compatible. Solo se aceptan archivos de audio (.mp3, .wav, .mp4, .m4a) y subtítulos (.srt).");
            }
        }
    };

    const handleUploadWrapper = async () => {
        setIsVisible(false); // Oculta el div
        setIsLoading(true); // Activa el estado de carga
        await handleUpload(); // Llama al método de subida
        setIsLoading(false); // Desactiva el estado de carga
    };

    const handleUpload = async () => {
        if (!audioFile && !srtFile) {
            setError("Por favor, selecciona un archivo de audio o subtítulos.");
            return;
        }

        const formData = new FormData();
        if (audioFile) formData.append("audio", audioFile);
        if (srtFile) formData.append("srt", srtFile);

        try {
            const response = await axios.post("http://127.0.0.1:5000/upload-files", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.segments) {
                setSegments(response.data.segments);
                setFilename(response.data.srt_filename || `${audioFile.name.split(".")[0]}_edited.srt`);
            }

            if (audioFile) {
                setAudioFileUrl(URL.createObjectURL(audioFile));
            }

            setError("");
        } catch (error) {
            console.error("Error durante la carga de archivos:", error);
            setError("Hubo un problema al procesar los archivos. Intenta nuevamente.");
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
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg space-y-6">
            {/* Mensaje de espera si está cargando */}
            {isLoading && (
                <div className="text-center mt-4">
                    <p className="text-lg font-bold text-yellow-400">Procesando, por favor espera...</p>
                    <div className="mt-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
                    </div>
                </div>
            )}

            {/* Div para adjuntar archivo */}
            {!isLoading && isVisible && (
                <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md mt-8 w-[450px] border border-gray-500/50 justify-content-center">
                    <h1 className="text-2xl font-bold text-center">Sube un archivo</h1>
                    <p className="text-center text-gray-400">
                        Puedes subir un archivo de audio para generar subtítulos automáticamente o cargar ambos archivos <code>.srt</code> para editarlos.
                    </p>
                    <ErrorMessage error={error} />
                    <FileInput
                        onFileChange={handleFileChange}
                        selectedFileName={selectedAudioFileName || selectedSrtFileName}
                        fileHelpText="Archivos soportados: .mp3, .wav, .mp4, .m4a para audio y .srt para subtítulos."
                    />
                    <UploadButton onUpload={handleUploadWrapper} />
                </div>
            )}

            {segments.length > 0 && <SubtitleEditor segments={segments} audioFileUrl={audioFileUrl} onSave={handleSave} />}
            {srtUrl && (
                <div className="text-center mt-4">
                    <a
                        href={srtUrl}
                        download={filename}
                        className="inline-block py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full"
                    >
                        Descargar archivo .srt
                    </a>
                </div>
            )}
        </div>
    );
}

export default FileUploader;

