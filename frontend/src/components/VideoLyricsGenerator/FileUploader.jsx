// frontend/src/components/VideoLyricsGenerator/FileUploader.jsx
// Componente para subir archivos

/* eslint-disable react/prop-types */

import { FaUpload } from 'react-icons/fa';

const FileUploader = ({ id, label, accept, file, onChange }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <label className="block text-lg font-medium text-gray-700 mb-4" htmlFor={id}>
      {label}
    </label>
    <div className="relative">
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={onChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />
      <label
        htmlFor={id}
        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
      >
        <FaUpload className="w-6 h-6 text-gray-400 mr-2" />
        <span className="text-gray-600">{file ? file.name : `Choose ${label}`}</span>
      </label>
    </div>
  </div>
);

export default FileUploader;
