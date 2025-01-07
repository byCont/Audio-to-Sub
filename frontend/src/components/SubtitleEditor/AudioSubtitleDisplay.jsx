// frontend/src/components/SubtitleEditor/AudioSubtitleDisplay.jsx
// Componente para reproducir audio y mostrar subtítulos en tiempo real

/* eslint-disable react/prop-types */
import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { formatTime, parseTimeToSeconds } from "../../utils/timeUtils";

const AudioSubtitleDisplay = ({
  audioFileUrl,
  videoFileUrl, // Nueva prop: URL del video
  editedSegments,
  onCurrentSubtitleIndexChange,
}) => {
  // Ref for wavesurfer container
  const containerRef = useRef(null);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Ref for video element
  const videoRef = useRef(null);

  // WaveSurfer hook
  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(86, 101, 115)",
    progressColor: "rgb(39, 55, 70)",
    url: audioFileUrl,
    plugins: useMemo(() => [Timeline.create()], []),
  });

  // Play/Pause handler
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

      // Find the current subtitle based on current time
      const index = editedSegments.findIndex(
        (segment) =>
          currentTime >= parseTimeToSeconds(segment.start) &&
          currentTime < parseTimeToSeconds(segment.end)
      );

      // Update current subtitle index if changed
      if (index !== currentSubtitleIndex) {
        setCurrentSubtitleIndex(index);

        // Optional: Notify parent component about subtitle index change
        if (onCurrentSubtitleIndexChange) {
          onCurrentSubtitleIndexChange(index);
        }
      }
    };

    // Track playing state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Update current time
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

  return (
    <div>
      {/* Video Display with Subtitles */}
      <div className="mb-4 bg-gray-800 p-4 rounded shadow w-full max-w-[960px] overflow-hidden aspect-video border border-gray-700 relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoFileUrl}
          className="w-full h-full object-cover"
          muted
        ></video>

        {/* Subtitles Overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded">
          <p className="text-center text-lg font-bold">
            {currentSubtitleIndex >= 0 && currentSubtitleIndex < editedSegments.length
              ? editedSegments[currentSubtitleIndex].text
              : "..."}
          </p>
        </div>
      </div>

      {/* Botón Play/Pause y Current Time */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">Current Time: {formatTime(currentTime)}</p>
        <button
          onClick={handlePlayPause}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* Wavesurfer Container */}
      <div className="mt-4">
        <div ref={containerRef} />
      </div>
    </div>
  );
};

export default AudioSubtitleDisplay;
