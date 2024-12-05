// frontend/src/components/SubtitleEditor/AudioSubtitleDisplay.jsx
// Componente para reproducir audio y mostrar subtítulos en tiempo real

/* eslint-disable react/prop-types */
import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { useWavesurfer } from '@wavesurfer/react';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import { formatTime, parseTimeToSeconds } from "../../utils/timeUtils";

const AudioSubtitleDisplay = ({ 
    audioFileUrl, 
    editedSegments, 
    onCurrentSubtitleIndexChange 
}) => {
    // Ref for wavesurfer container
    const containerRef = useRef(null);
    const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // WaveSurfer hook
    const { wavesurfer } = useWavesurfer({
        container: containerRef,
        height: 100,
        waveColor: 'rgb(86, 101, 115)',
        progressColor: 'rgb(39, 55, 70)',
        url: audioFileUrl,
        plugins: useMemo(() => [Timeline.create()], []),
    });

    // Play/Pause handler
    const handlePlayPause = useCallback(() => {
        if (wavesurfer) {
            wavesurfer.playPause();
        }
    }, [wavesurfer]);

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
        };

        // Add event listeners
        wavesurfer.on('audioprocess', handleTimeUpdate);
        wavesurfer.on('play', handlePlay);
        wavesurfer.on('pause', handlePause);
        wavesurfer.on('timeupdate', handleTimeChange);

        // Cleanup event listeners
        return () => {
            wavesurfer.un('audioprocess', handleTimeUpdate);
            wavesurfer.un('play', handlePlay);
            wavesurfer.un('pause', handlePause);
            wavesurfer.un('timeupdate', handleTimeChange);
        };
    }, [wavesurfer, editedSegments, currentSubtitleIndex, onCurrentSubtitleIndexChange]);

    return (
        <div>
            {/* Wavesurfer Container */}
            <div className="mb-4">
                <div ref={containerRef} />
            </div>

            {/* Audio Playback Info */}
            <div className="mb-4 flex justify-between items-center">
                <p>Current Time: {formatTime(currentTime)}</p>
                <button 
                    onClick={handlePlayPause} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>

            {/* Real-time Subtitle Display */}
            <div className="mb-4 bg-gray-800 p-2 rounded shadow">
                <p className="text-center text-lg font-bold">
                    {currentSubtitleIndex >= 0 && currentSubtitleIndex < editedSegments.length
                        ? editedSegments[currentSubtitleIndex].text
                        : "..."}
                </p>
            </div>
        </div>
    );
};

export default AudioSubtitleDisplay;