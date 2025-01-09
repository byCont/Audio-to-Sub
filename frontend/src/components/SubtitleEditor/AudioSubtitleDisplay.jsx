// frontend/src/components/SubtitleEditor/AudioSubtitleDisplay.jsx
// Componente para reproducir audio y mostrar subtítulos en tiempo real

/* eslint-disable react/prop-types */
import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { formatTime, parseTimeToSeconds } from "../../utils/timeUtils";

const AudioSubtitleDisplay = ({
  audioFileUrl,
  editedSegments,
  onCurrentSubtitleIndexChange,
}) => {
  const containerRef = useRef(null);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef(null);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(86, 101, 115)",
    progressColor: "rgb(39, 55, 70)",
    url: audioFileUrl,
    plugins: useMemo(() => [Timeline.create()], []),
  });

  const handlePlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    }
  }, [wavesurfer, isPlaying]);

  // Sync subtitles with audio playback
  useEffect(() => {
    if (!wavesurfer || !editedSegments.length) return;

    const handleTimeUpdate = () => {
      const currentTime = wavesurfer.getCurrentTime();

      const index = editedSegments.findIndex(
        (segment) =>
          currentTime >= parseTimeToSeconds(segment.start) &&
          currentTime < parseTimeToSeconds(segment.end)
      );

      if (index !== currentSubtitleIndex) {
        setCurrentSubtitleIndex(index);
        if (onCurrentSubtitleIndexChange) {
          onCurrentSubtitleIndexChange(index);
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleTimeChange = () => {
      setCurrentTime(wavesurfer.getCurrentTime());
      if (videoRef.current) {
        videoRef.current.currentTime = wavesurfer.getCurrentTime();
      }
    };

    // Add event listeners
    wavesurfer.on("audioprocess", handleTimeUpdate);
    wavesurfer.on("play", handlePlay);
    wavesurfer.on("pause", handlePause);
    wavesurfer.on("timeupdate", handleTimeChange);

    // Cleanup event listeners
    return () => {
      wavesurfer.un("audioprocess", handleTimeUpdate);
      wavesurfer.un("play", handlePlay);
      wavesurfer.un("pause", handlePause);
      wavesurfer.un("timeupdate", handleTimeChange);
    };
  }, [wavesurfer, editedSegments, currentSubtitleIndex, onCurrentSubtitleIndexChange]);

  return(
    <div className="flex flex-col items-center justify-center bg-gray-900 space-y-6">
      <h2 className="text-xl font-bold text-center">Preview</h2>
  
      {/* Video Display with Subtitles and Controls */}
      <div className="mb-4 bg-gray-800 p-4 rounded shadow w-full max-w-4xl overflow-hidden aspect-video border border-gray-700 relative flex items-center justify-center">
        {/* Subtitles Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 text-white px-2 py-2 rounded">
          <p className="text-center text-4xl font-bold">
            {currentSubtitleIndex >= 0 && currentSubtitleIndex < editedSegments.length
              ? editedSegments[currentSubtitleIndex].text
              : "..."}
          </p>
        </div>
  
        {/* Current Time Display */}
        <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-base text-white">
          {formatTime(currentTime)} / {formatTime(wavesurfer?.getDuration() || 0)}
        </p>
      </div>
  
      {/* Play/Pause Button */}
      <div className="flex justify-center">
        <button
          onClick={handlePlayPause}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
  
      {/* Wavesurfer Container */}
      <div className="w-full flex justify-center mt-4">
        <div ref={containerRef} className="w-full max-w-4xl" />
      </div>
    </div>
  );
};

export default AudioSubtitleDisplay;
