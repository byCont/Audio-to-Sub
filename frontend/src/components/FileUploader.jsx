// frontend/src/FileUploader.jsx
import { useState } from "react";
import axios from "axios";

function FileUploader() {
    const [file, setFile] = useState(null);
    const [subtitles, setSubtitles] = useState("");
    const [srtUrl, setSrtUrl] = useState(null);

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

            setSubtitles(response.data.subtitles);
            setSrtUrl(`http://127.0.0.1:5000${response.data.srt_url}`);
        } catch (error) {
            console.error("Error al generar subtítulos:", error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Subir y Generar Subtítulos</button>
            {subtitles && (
                <div>
                    <h2>Subtítulos Generados:</h2>
                    <p>{subtitles}</p>
                    {srtUrl && (
                        <a href={srtUrl} download="subtitulos.srt">
                            Descargar archivo .srt
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileUploader;
