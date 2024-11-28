// frontend/src/components/SubtitleEditor/SubtitleEditor.jsx
// Componente para editar subtítulos generados o adjuntados

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import SubtitleSegment from "./SubtitleSegment";
import ErrorAlert from "./ErrorAlert";
import AudioSubtitleDisplay from "./AudioSubtitleDisplay";
import {
    parseTimeToSeconds,
    validateTimeFormat,
    formatTimeToDisplay,
} from "../../utils/timeUtils";

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
    // eslint-disable-next-line no-unused-vars
    const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

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

    // Sync subtitles with audio playback (simulate for subtitle editor)
    useEffect(() => {
        const interval = setInterval(() => {
            // You might want to implement a more sophisticated way of tracking current subtitle
            const index = Math.floor(Math.random() * editedSegments.length);
            setCurrentSubtitleIndex(index);
        }, 3000);

        return () => clearInterval(interval);
    }, [editedSegments]);

    return (
        <div>
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-md mt-8 h-[600px] flex flex-col border border-gray-500/50  justify-content-start">
              <h2 className="text-xl font-bold mb-4 text-center">Subtitle Editor</h2>
              
              <ErrorAlert message={timeError} />

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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full mt-4"
              >
                  Save Changes
              </button>
          </div>          
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md mx-auto mt-8 flex flex-col w-full border border-gray-500/50">
                <AudioSubtitleDisplay 
                  audioFileUrl={audioFileUrl} 
                  editedSegments={editedSegments} 
                  onCurrentSubtitleIndexChange={setCurrentSubtitleIndex} 
                />

          </div>
      </div>
        
    );
};

export default SubtitleEditor;