// frontend/src/components/ErrorMessage.jsx
// Componente para mostrar mensajes de error

/* eslint-disable react/prop-types */
const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
      <div className="bg-red-600 text-white p-3 rounded-md">
          {error}
      </div>
  );
};

export default ErrorMessage;
