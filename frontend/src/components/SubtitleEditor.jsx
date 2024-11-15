// frontend/src/components/SubtitleEditor.jsx
import { useState } from "react";

// eslint-disable-next-line react/prop-types
function SubtitleEditor({ segments, onSave }) {
    const [editedSegments, setEditedSegments] = useState(segments);

    const handleTextChange = (index, newText) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].text = newText;
        setEditedSegments(updatedSegments);
    };

    const handleStartTimeChange = (index, newStartTime) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].start = newStartTime;
        setEditedSegments(updatedSegments);
    };

    const handleEndTimeChange = (index, newEndTime) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index].end = newEndTime;
        setEditedSegments(updatedSegments);
    };

    const handleSave = () => {
        onSave(editedSegments);
    };

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md max-w-lg mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4 text-center">SRT Reader & Editor</h2>
            <div className="space-y-4">
                {editedSegments.map((segment, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <div className="flex gap-2 text-sm">
                                <input
                                    type="text"
                                    value={segment.start}
                                    onChange={(e) => handleStartTimeChange(index, e.target.value)}
                                    className="bg-gray-700 text-white rounded px-2 py-1 w-28 text-center"
                                />
                                <span>→</span>
                                <input
                                    type="text"
                                    value={segment.end}
                                    onChange={(e) => handleEndTimeChange(index, e.target.value)}
                                    className="bg-gray-700 text-white rounded px-2 py-1 w-28 text-center"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleTextChange(index, "")} // Vaciar el texto
                                    className="text-gray-400 hover:text-red-400"
                                >
                                    🗑
                                </button>
                                <button
                                    onClick={() => alert("Editando...")} // Placeholder para editar
                                    className="text-gray-400 hover:text-blue-400"
                                >
                                    ✏️
                                </button>
                            </div>
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
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 mt-6 rounded w-full"
            >
                Save Changes
            </button>
        </div>
    );
}

export default SubtitleEditor;
