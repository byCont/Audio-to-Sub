// frontend/src/components/SubtitleEditor.jsx
// Componente para editar subtítulos generados

/* eslint-disable react/prop-types */
import { useState } from "react";

// Utility functions remain the same...
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

function SubtitleEditor({ segments, onSave }) {
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

    /// Merge with handleTimeChange
    const handleTimeChange = (index, type, newValue) => {
      const updatedSegments = [...editedSegments];
      updatedSegments[index][type] = newValue;
      setEditedSegments(updatedSegments);

      if (!validateTimeFormat(newValue)) {
          setTimeError(`Invalid time format for segment ${index + 1}. Use HH:MM:SS,mmm`);
          return;
      }

      if (type === 'start' && parseTimeToSeconds(newValue) >= parseTimeToSeconds(updatedSegments[index].end)) {
          setTimeError(`Start time must be less than end time in segment ${index + 1}`);
          return;
      }
      if (type === 'end' && parseTimeToSeconds(newValue) <= parseTimeToSeconds(updatedSegments[index].start)) {
          setTimeError(`End time must be greater than start time in segment ${index + 1}`);
          return;
      }

      setTimeError("");
  };

  const handleMergeSegments = (index) => {
      const updatedSegments = [...editedSegments];
      if (index < updatedSegments.length - 1) {
          // Combine the text of the current and next segment
          updatedSegments[index].text += " " + updatedSegments[index + 1].text;

          // Adjust the end time of the merged segment
          updatedSegments[index].end = updatedSegments[index + 1].end;

          // Remove the next segment
          updatedSegments.splice(index + 1, 1);

          setEditedSegments(updatedSegments);
      } else {
          setTimeError("No segment to merge with.");
      }
  };
    /// Ednd handleTimeChange
    const handleTimeBlur = (index, type, value) => {
        if (!validateTimeFormat(value)) {
            const updatedSegments = [...editedSegments];
            updatedSegments[index][type] = formatTimeToDisplay(parseTimeToSeconds(segments[index][type]));
            setEditedSegments(updatedSegments);
            setTimeError("");
            return;
        }

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

    const handleInsertSegment = (index) => {
        const currentSegment = editedSegments[index];
        const nextSegment = editedSegments[index + 1];
        
        let newStart, newEnd;
        
        if (nextSegment) {
            const currentEndTime = parseTimeToSeconds(currentSegment.end);
            const nextStartTime = parseTimeToSeconds(nextSegment.start);
            newStart = formatTimeToDisplay(currentEndTime);
            newEnd = formatTimeToDisplay((currentEndTime + nextStartTime) / 2);
        } else {
            const currentEndTime = parseTimeToSeconds(currentSegment.end);
            newStart = formatTimeToDisplay(currentEndTime);
            newEnd = formatTimeToDisplay(currentEndTime + 1);
        }

        const newSegment = {
            start: newStart,
            end: newEnd,
            text: "New segment"
        };

        const updatedSegments = [...editedSegments];
        updatedSegments.splice(index + 1, 0, newSegment);
        setEditedSegments(updatedSegments);
    };

    const handleSave = () => {
        const hasInvalidSegments = editedSegments.some(segment => 
            !validateTimeFormat(segment.start) || !validateTimeFormat(segment.end)
        );

        if (hasInvalidSegments) {
            setTimeError("Cannot save: Some segments have invalid time format");
            return;
        }

        const segmentsInSeconds = editedSegments.map(segment => ({
            ...segment,
            start: parseTimeToSeconds(segment.start).toString(),
            end: parseTimeToSeconds(segment.end).toString()
        }));
        onSave(segmentsInSeconds);
    };

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-lg mx-auto mt-8 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center">Subtitle Editor</h2>
            {timeError && (
                <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
                    {timeError}
                </div>
            )}
            <div className="overflow-y-auto flex-1 pr-2">
                {editedSegments.map((segment, index) => (
                    <div key={index} className="relative">
                        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 shadow-sm border border-gray-500/25">
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
                            </div>
                            <textarea
                                value={segment.text}
                                onChange={(e) => handleTextChange(index, e.target.value)}
                                className="bg-gray-700 text-white rounded px-2 py-1 w-full mt-1"
                                rows={2}
                            />
                        </div>
                        <button
                            onClick={() => handleInsertSegment(index)}
                            className="bg-gray-800 hover:bg-gray-600 text-gray-400 hover:text-green-400 py-1 px-2.5  rounded-full transition-colors duration-200 top-1/2 right-2 transform -translate-y-1/2 -translate-x border-gray-500/25"
                            title="Add line"
                        >
                            +
                        </button>
                        <button
                            onClick={() => handleMergeSegments(index)}
                            className="bg-gray-800 hover:bg-gray-600 text-gray-400 hover:text-cyan-400 py-1 px-3 rounded-full transition-colors duration-200 top-1/2 right-2 transform -translate-y-1/2 -translate-x border-gray-500/25"
                            title="Merge lines"
                        >
                            ↨
                        </button>
                        <button
                            onClick={() => handleDeleteSegment(index)}
                            className="bg-gray-800 hover:bg-gray-600 text-gray-400 hover:text-red-400 py-1 px-3 rounded-full transition-colors duration-200 top-1/2 right-2 transform -translate-y-1/2 -translate-x border-gray-500/25"
                            title="Delete line"
                        >
                            🗑
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <button
                    onClick={handleSave}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

export default SubtitleEditor;