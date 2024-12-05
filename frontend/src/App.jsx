// frontend/src/App.jsx
// Archivo principal de la aplicación

// import FileUploader from "./components/FileUploader/FileUploader";
import MP3ToVideo from "./components/VideoPreview/MP3ToVideo";

function App() {
  return (
    <div className="App bg-gray-700 text-white">
      <header className="bg-gray-800 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">
        Generador editor y de subtítulos
        </h1>
      </header>
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        {/* <FileUploader />  */}
        <MP3ToVideo />  
      </main>
    </div>
  );
}

export default App;
