// frontend/src/components/SubtitleEditor.jsx
import { useState } from "react";

// eslint-disable-next-line react/prop-types
function SubtitleEditor({ segments, onSave }) {
    const [editedSegments, setEditedSegments] = useState(segments);

    const handleInputChange = (index, field, value) => {
        const updatedSegments = [...editedSegments];
        updatedSegments[index][field] = value;
        setEditedSegments(updatedSegments);
    };

    return (
        <div>
            <h2>Editor de Subtítulos</h2>
            {editedSegments.map((segment, index) => (
                <div key={index} style={{ marginBottom: "1em" }}>
                    <div>
                        <label>Inicio: </label>
                        <input
                            type="text"
                            value={segment.start}
                            onChange={(e) =>
                                handleInputChange(index, "start", e.target.value)
                            }
                        />
                        <label> Fin: </label>
                        <input
                            type="text"
                            value={segment.end}
                            onChange={(e) =>
                                handleInputChange(index, "end", e.target.value)
                            }
                        />
                    </div>
                    <textarea
                        rows="2"
                        value={segment.text}
                        onChange={(e) => handleInputChange(index, "text", e.target.value)}
                    />
                </div>
            ))}
            <button onClick={() => onSave(editedSegments)}>Guardar Cambios</button>
        </div>
    );
}

export default SubtitleEditor;
