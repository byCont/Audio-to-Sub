// frontend/src/components/VideoLyricsGenerator/AudioControls.jsx
// Componente para controles de audio

/* eslint-disable react/prop-types */

import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AudioControls = ({ isPlaying, isMuted, volume, togglePlay, toggleMute, handleVolumeChange }) => (
  <div className="flex items-center justify-center space-x-4">
    <button
      onClick={togglePlay}
      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? <FaPause /> : <FaPlay />}
    </button>
    <button
      onClick={toggleMute}
      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
    </button>
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={volume}
      onChange={handleVolumeChange}
      className="w-32"
      aria-label="Volume control"
    />
  </div>
);

export default AudioControls;
