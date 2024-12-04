import { useState, useRef } from "react";
import FileUploader from "./FileUploader";
import AudioControls from "./AudioControls";
import StatusDisplay from "./StatusDisplay";
import { MdCancel } from "react-icons/md";

const VideoLyricsGenerator = () => {
  const [srtFile, setSrtFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Nueva variable para la imagen
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleGenerate = async () => {
    if (!audioFile || !imageFile) {
      setError("Please upload both an audio/video file and an image.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("image", imageFile);
    if (srtFile) formData.append("srt", srtFile); // Solo agrega el SRT si está disponible

    setStatus("uploading");
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setStatus("complete");
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Video Lyrics Generator
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        <FileUploader
          id="srtUpload"
          label="Subtitle File (.srt) (Optional)"
          accept=".srt"
          file={srtFile}
          onChange={(e) => setSrtFile(e.target.files[0])}
        />
        <FileUploader
          id="audioUpload"
          label="Audio/Video File"
          accept="audio/*,video/*"
          file={audioFile}
          onChange={(e) => setAudioFile(e.target.files[0])}
        />
        <FileUploader
          id="imageUpload"
          label="Image File (.jpg, .png)"
          accept="image/*"
          file={imageFile}
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>
      <AudioControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        togglePlay={togglePlay}
        toggleMute={toggleMute}
        handleVolumeChange={(e) => setVolume(e.target.value)}
      />
      <StatusDisplay status={status} progress={progress} error={error} />
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleGenerate}
          disabled={status !== "idle"}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Generate
        </button>
        {status !== "idle" && (
          <button
            onClick={() => {
              setStatus("idle");
              setError("");
              setProgress(0);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <MdCancel />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoLyricsGenerator;
