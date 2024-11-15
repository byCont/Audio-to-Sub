// frontend/src/components/FileUploader.jsx
import { useState } from "react";
import axios from "axios";
import SubtitleEditor from "./SubtitleEditor";

function FileUploader() {
    const [file, setFile] = useState(null);
    const [segments, setSegments] = useState([]);
    const [srtUrl, setSrtUrl] = useState(null);
    const [filename, setFilename] = useState("edited_subtitles.srt");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Por favor, selecciona un archivo de audio.");
            return;
        }

        const formData = new FormData();
        formData.append("audio", file);

        try {
            const response = await axios.post("http://127.0.0.1:5000/generate-subtitles", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSegments(response.data.segments);
            setSrtUrl(`http://127.0.0.1:5000${response.data.srt_url}`);
            setFilename(`${file.name.split(".")[0]}_edited.srt`);
        } catch (error) {
            console.error("Error al generar subtítulos:", error);
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
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Subir y Generar Subtítulos</button>
            {segments.length > 0 && (
                <SubtitleEditor segments={segments} onSave={handleSave} />
            )}
            {srtUrl && (
                <a href={srtUrl} download={filename}>
                    Descargar archivo .srt
                </a>
            )}
        </div>
    );
}

export default FileUploader;
