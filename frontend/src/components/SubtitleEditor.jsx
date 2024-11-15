// frontend/src/components/SubtitleEditor.jsx
// Componente para editar subtítulos generados

import { useState } from "react";

// Utility functions for time formatting
const formatTimeToDisplay = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.round((timeInSeconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
};

const parseTimeToSeconds = (timeString) => {
    try {
        const [time, milliseconds] = timeString.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return null;
    }
};

const validateTimeFormat = (timeString) => {
    return /^\d{2}:\d{2}:\d{2},\d{3}$/.test(timeString);
};

// eslint-disable-next-line react/prop-types
function SubtitleEditor({ segments, onSave }) {
    // eslint-disable-next-line react/prop-types
    const [editedSegments, setEditedSegments] = useState(segments.map(segment => ({
        ...segment,
        start: formatTimeToDisplay(Number(segment.start)),
        end: formatTimeToDisplay(Number(segment.end))
    })));
    const [timeError, setTimeError] = useState("");

    const handleTextChange = (index, newText) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].text = newText;
        setEditedSegments(updatedSegments);
    };

    const handleTimeChange = (index, type, newValue) => {
        // Permite la edición mientras el usuario escribe
        const updatedSegments = [...editedSegments];
        updatedSegments[index][type] = newValue;
        setEditedSegments(updatedSegments);

        // Valida el formato cuando el campo pierde el foco
        if (!validateTimeFormat(newValue)) {
            setTimeError(`Invalid time format for segment ${index + 1}. Use HH:MM:SS,mmm`);
            return;
        }

        // Valida que el tiempo de inicio sea menor que el tiempo final
        if (type === 'start' && parseTimeToSeconds(newValue) >= parseTimeToSeconds(updatedSegments[index].end)) {
            setTimeError(`Start time must be less than end time in segment ${index + 1}`);
            return;
        }
        if (type === 'end' && parseTimeToSeconds(newValue) <= parseTimeToSeconds(updatedSegments[index].start)) {
            setTimeError(`End time must be greater than start time in segment ${index + 1}`);
            return;
        }

        // Si todo está bien, limpia el error
        setTimeError("");
    };

    const handleTimeBlur = (index, type, value) => {
        // Si el formato no es válido, restaura el valor anterior
        if (!validateTimeFormat(value)) {
            const updatedSegments = [...editedSegments];
            updatedSegments[index][type] = formatTimeToDisplay(parseTimeToSeconds(segments[index][type]));
            setEditedSegments(updatedSegments);
            setTimeError("");
            return;
        }

        // Valida y actualiza los tiempos
        const currentTime = parseTimeToSeconds(value);
        const updatedSegments = [...editedSegments];
        
        if (type === 'start') {
            const endTime = parseTimeToSeconds(updatedSegments[index].end);
            if (currentTime >= endTime) {
                updatedSegments[index].start = formatTimeToDisplay(endTime - 0.001);
            }
        } else if (type === 'end') {
            const startTime = parseTimeToSeconds(updatedSegments[index].start);
            if (currentTime <= startTime) {
                updatedSegments[index].end = formatTimeToDisplay(startTime + 0.001);
            }
        }

        setEditedSegments(updatedSegments);
        setTimeError("");
    };

    const handleDeleteSegment = (index) => {
        const updatedSegments = [...editedSegments];
        updatedSegments.splice(index, 1);
        setEditedSegments(updatedSegments);
    };

    const handleAddSegment = () => {
        const lastSegment = editedSegments[editedSegments.length - 1];
        const newStart = lastSegment ? lastSegment.end : "00:00:00,000";
        const newEndTime = parseTimeToSeconds(newStart) + 1;
        const newSegment = {
            start: newStart,
            end: formatTimeToDisplay(newEndTime),
            text: "New segment"
        };
        setEditedSegments([...editedSegments, newSegment]);
    };

    const handleSave = () => {
        // Verifica que todos los segmentos tengan formato válido
        const hasInvalidSegments = editedSegments.some(segment => 
            !validateTimeFormat(segment.start) || !validateTimeFormat(segment.end)
        );

        if (hasInvalidSegments) {
            setTimeError("Cannot save: Some segments have invalid time format");
            return;
        }

        // Convert time format back to seconds before saving
        const segmentsInSeconds = editedSegments.map(segment => ({
            ...segment,
            start: parseTimeToSeconds(segment.start).toString(),
            end: parseTimeToSeconds(segment.end).toString()
        }));
        onSave(segmentsInSeconds);
    };

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-lg mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4 text-center">SRT Reader & Editor</h2>
            {timeError && (
                <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
                    {timeError}
                </div>
            )}
            <div className="space-y-4">
                {editedSegments.map((segment, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <div className="flex gap-2 text-sm">
                                <input
                                    type="text"
                                    value={segment.start}
                                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                    onBlur={(e) => handleTimeBlur(index, 'start', e.target.value)}
                                    placeholder="HH:MM:SS,mmm"
                                    className="bg-gray-700 text-white rounded px-2 py-1 w-32 text-center font-mono"
                                />
                                <span>→</span>
                                <input
                                    type="text"
                                    value={segment.end}
                                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                    onBlur={(e) => handleTimeBlur(index, 'end', e.target.value)}
                                    placeholder="HH:MM:SS,mmm"
                                    className="bg-gray-700 text-white rounded px-2 py-1 w-32 text-center font-mono"
                                />
                            </div>
                            <button
                                onClick={() => handleDeleteSegment(index)}
                                className="text-gray-400 hover:text-red-400"
                            >
                                🗑
                            </button>
                        </div>
                        <textarea
                            value={segment.text}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            className="bg-gray-700 text-white rounded px-2 py-1 w-full mt-1"
                            rows={2}
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleAddSegment}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 mt-4 rounded w-full"
            >
                Add New Segment
            </button>
            <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-6 rounded w-full"
            >
                Save Changes
            </button>
        </div>
    );
}

export default SubtitleEditor;