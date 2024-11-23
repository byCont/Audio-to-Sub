// frontend/src/components/SubtitleSegment.jsx
// Componente para mostrar y editar un segmento de subtítulos

/* eslint-disable react/prop-types */
const SubtitleSegment = ({
  index,
  segment,
  onTextChange,
  onTimeChange,
  onTimeBlur,
  onInsert,
  onMerge,
  onDelete,
}) => {
  return (
      <div className="relative mb-4">
          <div className="bg-gray-800 rounded-lg p-2 flex flex-col shadow-sm border border-gray-500/50">
              <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <div className="flex gap-2 text-sm">
                      <input
                          type="text"
                          value={segment.start}
                          onChange={(e) => onTimeChange(index, 'start', e.target.value)}
                          onBlur={(e) => onTimeBlur(index, 'start', e.target.value)}
                          className="bg-gray-700 text-white rounded px-2 py-1 w-32 text-center font-mono"
                      />
                      <span>→</span>
                      <input
                          type="text"
                          value={segment.end}
                          onChange={(e) => onTimeChange(index, 'end', e.target.value)}
                          onBlur={(e) => onTimeBlur(index, 'end', e.target.value)}
                          className="bg-gray-700 text-white rounded px-2 py-1 w-32 text-center font-mono"
                      />
                  </div>
              </div>
              <textarea
                  value={segment.text}
                  onChange={(e) => onTextChange(index, e.target.value)}
                  className="bg-gray-700 text-white rounded px-2 py-1 w-full mt-2"
                  rows={2}
              />
          </div>
          <div className="flex justify-end mt-2 gap-2">
              <button onClick={() => onInsert(index)} className="bg-gray-800 hover:bg-gray-600 text-green-400 py-1 px-2.5 rounded-full border border-gray-500/50">
                  +
              </button>
              <button onClick={() => onMerge(index)} className="bg-gray-800 hover:bg-gray-600 text-cyan-400 py-1 px-3 rounded-full border border-gray-500/50">
                  ↨
              </button>
              <button onClick={() => onDelete(index)} className="bg-gray-800 hover:bg-gray-600 text-red-400 py-1 px-2.5 rounded-full border border-gray-500/50">
                  🗑
              </button>
          </div>
      </div>
  );
};

export default SubtitleSegment;
