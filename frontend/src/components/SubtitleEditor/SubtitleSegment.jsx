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
      <div className="relative mb-2">
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
              <button onClick={() => onInsert(index)} title="Add" className="bg-gray-800 hover:bg-gray-600 text-green-400 rounded-full border border-gray-500/50 py-1 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#75FB4C"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
              <button onClick={() => onMerge(index)} title="Merge" className="bg-gray-800 hover:bg-gray-600 text-cyan-400 rounded-full border border-gray-500/50 px-1 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#75FBFD"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 19h3v3h2v-3h3l-4-4-4 4zm8-15h-3V1h-2v3H8l4 4 4-4zM4 9v2h16V9H4z"/><path d="M4 12h16v2H4z"/></svg>
              </button>
              <button onClick={() => onDelete(index)} title="Delete" className="bg-gray-800 hover:bg-gray-600 text-red-400 rounded-full border border-gray-500/50 py-1 px-1">
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#ff8a8a"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
          </div>
      </div>
  );
};

export default SubtitleSegment;
