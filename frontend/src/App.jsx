import FileUploader from "./components/FileUploader";

function App() {
  return (
    <div className="App bg-gray-600 min-h-screen text-white">
      <header className="bg-gray-800 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">
          Editor y Generador de Subtítulos
        </h1>
      </header>
      <main className="p-6">
        <FileUploader />
      </main>
    </div>
  );
}

export default App;
