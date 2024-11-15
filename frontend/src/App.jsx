// frontend/src/App.jsx
// Componente principal que coordina la carga y edición de subtítulos
import FileUploader from "./components/FileUploader";

function App() {
  return (
      <div className="App">
          <h1>Editor y generador de subtitulos</h1>
          <FileUploader />
      </div>
  );
}

export default App;
