//frontend/src/components/VideoPreview/MP3ToVideo.jsx
// Componente para generar un video a partir de un audio y una imagen

import { useState } from 'react';
import axios from 'axios';

const MP3ToVideo = () => {
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [subtitle, setSubtitle] = useState(null);
    const [videoURL, setVideoURL] = useState('');
    const [loading, setLoading] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image || !audio) {
            alert('Por favor sube una imagen y un audio');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('audio', audio);
        if (subtitle) formData.append('subtitle', subtitle); // Adjuntar subtítulos si están presentes
    
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setVideoURL(`http://127.0.0.1:5000/output/${response.data.output_video}`);
        } catch (err) {
            console.error(err);
            alert('Error al convertir el video');
        }
        setLoading(false);
    };
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Generador de Video</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="image" className="block text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-full cursor-pointer">
                    Subir Imagen <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required />
                </label>
                <label htmlFor="audio" className="block text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-full cursor-pointer">
                    Subir Audio <input type="file" onChange={(e) => setAudio(e.target.files[0])} accept="audio/*" required />
                </label>
                <label htmlFor="subtitle" className="block text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-full cursor-pointer">
                    Subir Subtítulos (opcional) <input type="file" onChange={(e) => setSubtitle(e.target.files[0])} accept=".srt" />
                </label>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : 'Generar Video'}
                </button>
            </form>
            {videoURL && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold">Video Generado:</h2>
                    <video src={videoURL} controls className="mt-4 w-full max-w-lg rounded-lg"></video>
                </div>
            )}
        </div>
    );
};

export default MP3ToVideo;
