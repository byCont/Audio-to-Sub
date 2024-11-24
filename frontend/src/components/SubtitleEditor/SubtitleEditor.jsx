// frontend/src/components/SubtitleEditor/SubtitleEditor.jsx
// Componente para editar subtítulos generados

/* eslint-disable react/prop-types */
import { useState } from "react";
import SubtitleSegment from "./SubtitleSegment";
import ErrorAlert from "./ErrorAlert";
import {
    formatTimeToDisplay,
    parseTimeToSeconds,
    validateTimeFormat,
} from "../../utils/timeUtils";

const SubtitleEditor = ({ segments, onSave }) => {
    const [editedSegments, setEditedSegments] = useState(
        segments.map((segment) => ({
            ...segment,
            start: formatTimeToDisplay(Number(segment.start)),
            end: formatTimeToDisplay(Number(segment.end)),
            text: segment.text.trim(),
        }))
    );
    const [timeError, setTimeError] = useState("");

    // Handlers
    const handleTextChange = (index, newText) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].text = newText.trimStart();
        setEditedSegments(updatedSegments);
    };

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

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-8 h-[600px] flex flex-col border border-gray-500/50">
            <h2 className="text-xl font-bold mb-4 text-center">Subtitle Editor</h2>
            <ErrorAlert message={timeError} />
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