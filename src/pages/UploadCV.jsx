import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Components
import UploadCVSuccess from "../components/Sections/UploadCVSuccess";

// Services, Context & Assets
import { Icons } from "../assets/icons";
import { uploadService } from "../services/api/uploads.api"; // Asegúrate de apuntar a la nueva ruta
import { useAuth } from "../components/context/AuthContext";   // 1. IMPORTAMOS EL CONTEXTO

const UploadCV = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // EXTRAEMOS EL USUARIO DEL ESTADO GLOBAL
  const { user } = useAuth();

  // Estados de Negocio
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados UI: "idle" | "uploading" | "success"
  const [uiState, setUiState] = useState("idle");

  // --- Lógica de Negocio (Helpers) ---
  const validateFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const hasInvalid = newFiles.some((file) => file.type !== "application/pdf");

    if (hasInvalid) {
      setError("Formato de archivo inválido. Por favor, carga solo archivos PDF compatibles.");
      return [];
    }

    setError(null);
    return newFiles;
  };

  // --- Handlers de Eventos ---
  const handleFileSelection = (e) => {
    const validated = validateFiles(e.target.files);
    if (validated.length === 0) return;

    setFiles((prev) => [...prev, ...validated]);
    e.target.value = ""; 
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const validated = validateFiles(e.dataTransfer.files);
    if (validated.length === 0) return;

    setFiles((prev) => [...prev, ...validated]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    if (!user) {
      setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
      return;
    }

    setUiState("uploading");
    setError(null);

    try {
      await uploadService.uploadCVs(files);
      setUiState("success");
    } catch (err) {
      console.error("Fallo al subir:", err);
      setError(err.message);
      setUiState("idle");
    }
};

  const handleReset = () => {
    setFiles([]);
    setUiState("idle");
    setError(null);
  };

  // --- Sub-componentes ---
  const FileItem = ({ file, index }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <img src={Icons.stats.vacantCreateBlue} alt="Check" className="w-5 h-5 object-contain" />
        <span className="text-gray-700 font-semibold text-sm truncate max-w-xs">
          {file.name}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-gray-300 text-xs font-medium">
          {(file.size / 1024).toFixed(0)} KB
        </span>
        <button
          onClick={() => removeFile(index)}
          className="text-gray-400 hover:text-red-500 transition-colors font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );

  // --- Renderizado Condicional: Estado de Éxito ---
  if (uiState === "success") {
    return <UploadCVSuccess count={files.length} onReset={handleReset} />;
  }

  // --- Renderizado Condicional: Estado de Carga ---
  if (uiState === "uploading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in p-10">
        <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl">
          <h2 className="text-white text-3xl font-medium tracking-tight mb-4">
            Extrayendo información de los CVs
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Procesando {files.length} documentos...
          </p>
          <img 
            src={Icons.auth.loading} 
            alt="Cargando" 
            className="w-12 h-12 animate-spin filter brightness-0 invert opacity-70" 
          />
        </div>
      </div>
    );
  }

  // --- Renderizado Normal: Formulario ---
  return (
    <div className="p-10 max-w-3xl mx-auto animate-fade-in relative">
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-[#447ECA] text-white px-6 py-3 rounded-2xl font-black text-sm mb-5 hover:bg-[#356ab0] hover:shadow-lg active:scale-95 transition-all uppercase tracking-wider"
      >
        Volver
      </button>

      <div className="bg-white rounded-[32px] shadow-sm p-8 border border-gray-100 relative">
        
        {files.length > 0 && (
          <div className="flex justify-between items-center mb-10 animate-fade-in">
            <div className="bg-[#E9F7FF] flex items-center gap-5 p-5 rounded-2xl border border-[#D1E9FF]">
              <div className="w-12 h-12 bg-[#447ECA] rounded-xl flex items-center justify-center shadow-inner">
                <img src={Icons.stats.uploadCv} alt="Documento" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">
                  Documentos cargados
                </p>
                <p className="text-[#447ECA] text-3xl font-black leading-none">
                  {files.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFiles([])}
              className="flex items-center gap-2 text-red-400 bg-red-50 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-red-100 transition-all uppercase tracking-tight"
            >
              Descartar Documentos
            </button>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 mx-auto w-full
                        ${isDragging ? "bg-gray-50 border-[#447ECA] scale-[1.01]" : "bg-white border-gray-200"}
                        ${files.length > 0 ? "py-10 max-w-[90%]" : "py-12 max-w-[90%]"}`}
        >
          {isDragging ? (
            <div className="text-center pointer-events-none">
              <h2 className="text-[#447ECA] text-6xl font-black mb-2 tracking-tighter italic">
                ¡SÚELTALOS!
              </h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">
                Arrastra y suelta el PDF aquí
              </p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#DCF9FF] rounded-3xl flex items-center justify-center mb-8 border border-[#E9F7FF]">
                <img src={Icons.stats.vacantCreateBlue} alt="Documento" className="w-10 h-10 object-contain" />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelection}
                accept=".pdf,application/pdf"
                className="hidden"
                multiple
              />

              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-[#447ECA] text-white px-6 py-3 rounded-2xl font-black text-sm mb-5 hover:bg-[#356ab0] hover:shadow-lg active:scale-95 transition-all uppercase tracking-wider"
              >
                Seleccionar archivos PDF
              </button>
              <p className="text-gray-400 text-xs font-bold italic tracking-wide uppercase">
                O arrastra y suelta el PDF aquí
              </p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-12 animate-slide-up">
            <div className="flex justify-between text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 px-2">
              <span>Nombre del documento</span>
              <span>Acciones</span>
            </div>
            <div className="space-y-1">
              {files.map((file, index) => (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-end mt-12">
              <button 
                onClick={handleUpload}
                className="bg-[#447ECA] text-white px-10 py-3 rounded-2xl font-black text-sm hover:bg-[#356ab0] shadow-xl transition-all uppercase tracking-widest active:scale-95"
              >
                Subir Archivos
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-center gap-4 animate-fade-in">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black">
              !
            </div>
            <div>
              <p className="text-red-600 font-black text-xs uppercase tracking-tight">
                Aviso
              </p>
              <p className="text-red-500/80 text-[11px] font-bold italic">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCV;