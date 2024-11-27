// frontend/src/components/SubtitleEditor/SubtitleEditor.jsx
// Componente para editar subtítulos generados

/* eslint-disable react/prop-types */
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useWavesurfer } from '@wavesurfer/react';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

import SubtitleSegment from "./SubtitleSegment";
import ErrorAlert from "./ErrorAlert";
import {
    formatTimeToDisplay,
    parseTimeToSeconds,
    validateTimeFormat,
} from "../../utils/timeUtils";

// Utility function to format time
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SubtitleEditor = ({ segments, onSave, audioFileUrl }) => {
    // Prepare initial segments
    const [editedSegments, setEditedSegments] = useState(
        segments.map((segment) => ({
            ...segment,
            start: formatTimeToDisplay(Number(segment.start)),
            end: formatTimeToDisplay(Number(segment.end)),
            text: segment.text.trim(),
        }))
    );
    const [timeError, setTimeError] = useState("");
    const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

    // Ref for wavesurfer container
    const containerRef = useRef(null);

    // WaveSurfer hook
    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: containerRef,
        height: 100,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        url: audioFileUrl,
        plugins: useMemo(() => [Timeline.create()], []),
    });

    // Text change handler
    const handleTextChange = (index, newText) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].text = newText.trimStart();
        setEditedSegments(updatedSegments);
    };

    // Time change handler
    const handleTimeChange = (index, type, newValue) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index][type] = newValue;

        if (!validateTimeFormat(newValue)) {
            setTimeError(`Invalid time format for segment ${index + 1}. Use HH:MM:SS,mmm`);
            return;
        }

        if (type === "start" && parseTimeToSeconds(newValue) >= parseTimeToSeconds(updatedSegments[index].end)) {
            setTimeError(`Start time must be less than end time in segment ${index + 1}`);
            return;
        }
        if (type === "end" && parseTimeToSeconds(newValue) <= parseTimeToSeconds(updatedSegments[index].start)) {
            setTimeError(`End time must be greater than start time in segment ${index + 1}`);
            return;
        }

        setTimeError("");
        setEditedSegments(updatedSegments);
    };

    const handleTimeBlur = (index, type, value) => {
        if (!validateTimeFormat(value)) {
            const updatedSegments = [...editedSegments];
            updatedSegments[index][type] = formatTimeToDisplay(parseTimeToSeconds(segments[index][type]));
            setEditedSegments(updatedSegments);
            setTimeError("");
            return;
        }

        setTimeError("");
    };

    const handleMergeSegments = (index) => {
        const updatedSegments = [...editedSegments];
        if (index < updatedSegments.length - 1) {
            updatedSegments[index].text += " " + updatedSegments[index + 1].text;
            updatedSegments[index].end = updatedSegments[index + 1].end;
            updatedSegments.splice(index + 1, 1);
            setEditedSegments(updatedSegments);
        } else {
            setTimeError("No segment to merge with.");
        }
    };

    const handleDeleteSegment = (index) => {
        const updatedSegments = [...editedSegments];
        updatedSegments.splice(index, 1);
        setEditedSegments(updatedSegments);
    };

    const handleInsertSegment = (index) => {
        const currentSegment = editedSegments[index];
        const nextSegment = editedSegments[index + 1];
        const currentEndTime = parseTimeToSeconds(currentSegment.end);

        const newSegment = {
            start: formatTimeToDisplay(currentEndTime),
            end: nextSegment
                ? formatTimeToDisplay((currentEndTime + parseTimeToSeconds(nextSegment.start)) / 2)
                : formatTimeToDisplay(currentEndTime + 1),
            text: "New segment",
        };

        const updatedSegments = [...editedSegments];
        updatedSegments.splice(index + 1, 0, newSegment);
        setEditedSegments(updatedSegments);
    };

    // Play/Pause handler
    const onPlayPause = useCallback(() => {
        wavesurfer && wavesurfer.playPause();
    }, [wavesurfer]);

    // Save handler
    const handleSave = () => {
        const hasInvalidSegments = editedSegments.some(
            (segment) =>
                !validateTimeFormat(segment.start) || !validateTimeFormat(segment.end)
        );

        if (hasInvalidSegments) {
            setTimeError("Cannot save: Some segments have invalid time format");
            return;
        }

        const segmentsInSeconds = editedSegments.map((segment) => ({
            ...segment,
            start: parseTimeToSeconds(segment.start).toString(),
            end: parseTimeToSeconds(segment.end).toString(),
        }));

        onSave(segmentsInSeconds);
    };

    // Sync subtitles with audio playback
    useEffect(() => {
        if (!wavesurfer) return;

        const handleTimeUpdate = () => {
            const currentTime = wavesurfer.getCurrentTime();

            const index = editedSegments.findIndex(
                (segment) =>
                    currentTime >= parseTimeToSeconds(segment.start) &&
                    currentTime < parseTimeToSeconds(segment.end)
            );

            if (index !== currentSubtitleIndex) {
                setCurrentSubtitleIndex(index);
            }
        };

        wavesurfer.on('audioprocess', handleTimeUpdate);

        return () => {
            wavesurfer.un('audioprocess', handleTimeUpdate);
        };
    }, [editedSegments, currentSubtitleIndex, wavesurfer]);

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-8 h-[600px] flex flex-col border border-gray-500/50">
            <h2 className="text-xl font-bold mb-4 text-center">Subtitle Editor</h2>
            
            <ErrorAlert message={timeError} />
            
            {/* Wavesurfer Container */}
            <div className="mb-4">
                <div ref={containerRef} />
            </div>

            {/* Audio Playback Info */}
            <div className="mb-4 flex justify-between items-center">
                <p>Current Time: {formatTime(currentTime)}</p>
                <button 
                    onClick={onPlayPause} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>

            {/* Real-time Subtitle Display */}
            <div className="mb-4 bg-gray-800 p-2 rounded shadow">
                <p className="text-center text-lg font-bold">
                    {currentSubtitleIndex >= 0 && currentSubtitleIndex < editedSegments.length
                        ? editedSegments[currentSubtitleIndex].text
                        : "No subtitles available at this moment."}
                </p>
            </div>

            {/* Subtitle Editor */}
            <div className="overflow-y-auto flex-1 pr-2">
                {editedSegments.map((segment, index) => (
                    <SubtitleSegment
                        key={index}
                        index={index}
                        segment={segment}
                        onTextChange={handleTextChange}
                        onTimeChange={handleTimeChange}
                        onTimeBlur={handleTimeBlur}
                        onInsert={handleInsertSegment}
                        onMerge={handleMergeSegments}
                        onDelete={handleDeleteSegment}
                    />
                ))}
            </div>
            
            <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
                Save Changes
            </button>
        </div>
    );
};

export default SubtitleEditor;