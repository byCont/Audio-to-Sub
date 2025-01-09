// frontend/src/App.jsx
// Archivo principal de la aplicación

import FileUploader from "./components/FileUploader/FileUploader";
// import MP3ToVideo from "./components/VideoPreview/MP3ToVideo";

function App() {
  return (
    <div className="App bg-gray-300 text-white min-h-screen flex flex-col">
      <header className="bg-gray-800 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">
          Generador editor y de subtítulos
        </h1>
      </header>
      <main className="bg-gray-700 flex-grow flex items-center justify-center">
        {/* Contenedor principal sin límites de ancho */}
        <div className="w-full p-4">
          <FileUploader />
          {/* <MP3ToVideo /> */}
        </div>
      </main>
      {/* <footer className="bg-gray-800 py-4 text-center text-sm text-white">
        © 2025 Mi Aplicación. Todos los derechos reservados.
      </footer> */}
    </div>
  );
}

export default App;
