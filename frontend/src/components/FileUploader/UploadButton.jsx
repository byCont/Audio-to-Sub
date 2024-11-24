// frontend/src/components/FileUploader/UploadButton.jsx
// Componente para manejar la carga de archivos

/* eslint-disable react/prop-types */
const UploadButton = ({ onUpload }) => {
  return (
      <button
          onClick={onUpload}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
      >
          Subir archivo
      </button>
  );
};

export default UploadButton;
