// frontend/src/components/FileUploader/FileInput.jsx
// Componente para manejar la selección de archivos

/* eslint-disable react/prop-types */
const FileInput = ({ onFileChange, selectedFileName, fileHelpText }) => {
  return (
      <div className="space-y-4">
          <label
              htmlFor="fileInput"
              className="block text-center bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-full cursor-pointer"
          >
              Seleccionar archivo
          </label>
          <input
              id="fileInput"
              type="file"
              onChange={onFileChange}
              className="hidden"
              aria-describedby="fileHelp"
          />
          {selectedFileName && (
              <p className="text-center text-green-400">
                  Archivo seleccionado: <span className="font-medium">{selectedFileName}</span>
              </p>
          )}
          <p id="fileHelp" className="text-sm text-gray-400 text-center">
              {fileHelpText}
          </p>
      </div>
  );
};

export default FileInput;
