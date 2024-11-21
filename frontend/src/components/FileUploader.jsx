import { useState } from "react";
import axios from "axios";
import SubtitleEditor from "./SubtitleEditor";

function FileUploader() {
    const [file, setFile] = useState(null);
    const [segments, setSegments] = useState([]);
    const [srtFile, setSrtFile] = useState(null);
    const [filename, setFilename] = useState("edited_subtitles.srt");
    const [srtUrl, setSrtUrl] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.name.split(".").pop();
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
        <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg space-y-6">
            <h1 className="text-2xl font-bold text-center">Sube un archivo</h1>
            <p className="text-center text-gray-400">
                Puedes subir un archivo de audio para generar subtítulos automáticamente o cargar un archivo <code>.srt</code> para editarlo.
            </p>
            {error && (
                <div className="bg-red-600 text-white p-3 rounded-md">
                    {error}
                </div>
            )}
            <div className="space-y-4">
                <label
                    htmlFor="fileInput"
                    className="block text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg cursor-pointer"
                >
                    Seleccionar archivo
                </label>
                <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-describedby="fileHelp"
                />
                <p id="fileHelp" className="text-sm text-gray-400 text-center">
                    Archivos soportados: <code>.mp3, .wav, .mp4, .m4a</code> para audio y <code>.srt</code> para subtítulos.
                </p>
            </div>
            <button
                onClick={handleUpload}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
                Subir archivo
            </button>
            {segments.length > 0 && (
                <SubtitleEditor segments={segments} onSave={handleSave} />
            )}
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
