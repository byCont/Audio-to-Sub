// frontend/src/components/SubtitleEditor/ErrorAlert.jsx
// Componente para mostrar mensajes de error

/* eslint-disable react/prop-types */
const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
      <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
          {message}
      </div>
  );
};

export default ErrorAlert;
