// frontend/src/components/VideoLyricsGenerator/StatusDisplay.jsx
// Componente para mostrar el estado de la carga de archivos

/* eslint-disable react/prop-types */

import { BiError } from 'react-icons/bi';

const StatusDisplay = ({ status, progress, error }) => (
  <div className="space-y-4">
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="text-gray-600 capitalize">
      Status: {status === "idle" ? "Ready" : status}
    </p>
    {error && (
      <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-lg">
        <BiError className="w-5 h-5 mr-2" />
        {error}
      </div>
    )}
  </div>
);

export default StatusDisplay;
