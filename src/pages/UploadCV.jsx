import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import UploadCVSuccess from "../components/Sections/UploadCVSuccess";

// Services, Context & Assets
import { Icons } from "../assets/icons";
import { vacanciesApi } from "../services/api/vacancies.api";
import { useAuth } from "../components/context/AuthContext";

const UploadCV = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user } = useAuth();

  // Estados
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [uiState, setUiState] = useState("idle");

  // Vacantes disponibles para asociar los CVs
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState("");

  // Contador para manejar bubbling de eventos drag
  const dragCounter = useRef(0);

  // Carga las vacantes activas para poder asociar los CVs a una de ellas
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await vacanciesApi.getAll();
        if (cancelled) return;
        const active = (data || []).filter((v) => v.status === "ACTIVE");
        setVacancies(active);
      } catch (err) {
        console.error("Error cargando vacantes:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // --- Lógica de Negocio (Helpers) ---
  const validateFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList);
    const hasInvalid = newFiles.some((file) => file.type !== "application/pdf");

    if (hasInvalid) {
      setError("Formato de archivo inválido. Por favor, carga solo archivos PDF compatibles.");
      return [];
    }

    setError(null);
    return newFiles;
  }, []);

  // --- Manejo Global de Drag & Drop ---
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      
      // Activamos la UI si lo que arrastran son archivos
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      
      // Solo desactivamos cuando el contador llega a 0
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const validated = validateFiles(e.dataTransfer.files);
        if (validated.length > 0) {
          setFiles((prev) => [...prev, ...validated]);
        }
      }
    };

    // Adjuntamos los eventos al objeto windows
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    // Cleanup remueve los eventos cuando el componente se desmonta
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [validateFiles]);

  // --- Handlers Manuales ---
  const handleFileSelection = (e) => {
    const validated = validateFiles(e.target.files);
    if (validated.length === 0) return;

    setFiles((prev) => [...prev, ...validated]);
    e.target.value = ""; 
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

    if (!selectedVacancyId) {
      setError("Selecciona una vacante antes de subir los CVs.");
      return;
    }

    setUiState("uploading");
    setError(null);

    try {
      const results = await vacanciesApi.uploadCVs(selectedVacancyId, files);
      // La API procesa cada PDF independientemente (§4). Reportamos si alguno falló.
      const failed = Array.isArray(results) ? results.filter((r) => r && r.success === false) : [];
      if (failed.length > 0) {
        setError(`${failed.length} de ${files.length} archivo(s) no pudieron procesarse.`);
      }
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

  // --- Renderizado Condicional: UI de Carga o Éxito ---
  if (uiState === "success") return <UploadCVSuccess count={files.length} onReset={handleReset} />;
  
  if (uiState === "uploading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in p-10">
        <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-2xl">
          <h2 className="text-white text-3xl font-medium tracking-tight mb-4">Extrayendo información de los CVs</h2>
          <p className="text-gray-400 text-lg mb-10">Procesando {files.length} documentos...</p>
          <img src={Icons.auth.loading} alt="Cargando" className="w-12 h-12 animate-spin filter brightness-0 invert opacity-70" />
        </div>
      </div>
    );
  }

  // --- Renderizado Normal ---
  return (
    <>
      {/* OVERLAY GLOBAL DE DRAG & DROP */}
      {isDragging && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#808080]/90 backdrop-blur-sm transition-all duration-300 pointer-events-none">
          <div className="border-4 border-white border-dashed rounded-[40px] flex flex-col items-center justify-center w-[90%] h-[90%] max-w-5xl animate-pulse">
            <h2 className="text-white text-5xl md:text-8xl font-black mb-4 tracking-tighter italic shadow-sm">
              ¡SÚELTALOS AQUÍ!
            </h2>
            <p className="text-white/90 font-bold uppercase text-sm md:text-xl tracking-[0.3em]">
              Arrastra tus PDFs a cualquier parte de la pantalla
            </p>
          </div>
        </div>
      )}

      <div className="p-10 max-w-3xl mx-auto animate-fade-in relative">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#447ECA] text-white px-6 py-3 rounded-2xl font-black text-sm mb-5 hover:bg-[#356ab0] hover:shadow-lg active:scale-95 transition-all uppercase tracking-wider"
        >
          Volver
        </button>

        <div className="bg-white rounded-[32px] shadow-sm p-8 border border-gray-100 relative">
          <div className="mb-8">
            <label htmlFor="vacancySelect" className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-2">
              Vacante destino <span className="text-red-500">*</span>
            </label>
            <select
              id="vacancySelect"
              value={selectedVacancyId}
              onChange={(e) => setSelectedVacancyId(e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 text-sm text-[#334155]"
            >
              <option value="" disabled>Selecciona una vacante activa...</option>
              {vacancies.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            {vacancies.length === 0 && (
              <p className="text-gray-400 text-xs mt-2">No hay vacantes activas. Crea una vacante antes de subir CVs.</p>
            )}
          </div>

          {files.length > 0 && (
            <div className="flex justify-between items-center mb-10 animate-fade-in">
              <div className="bg-[#E9F7FF] flex items-center gap-5 p-5 rounded-2xl border border-[#D1E9FF]">
                <div className="w-12 h-12 bg-[#447ECA] rounded-xl flex items-center justify-center shadow-inner">
                  <img src={Icons.stats.uploadCv} alt="Documento" className="w-6 h-6 object-contain brightness-0 invert" />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Documentos cargados</p>
                  <p className="text-[#447ECA] text-3xl font-black leading-none">{files.length}</p>
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

          {/* Caja estática */}
          <div className={`relative border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 mx-auto w-full bg-white border-gray-200 ${files.length > 0 ? "py-10 max-w-[90%]" : "py-12 max-w-[90%]"}`}>
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
              O arrastra los PDFs a cualquier parte
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-12 animate-slide-up">
              <div className="flex justify-between text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 px-2">
                <span>Nombre del documento</span>
                <span>Acciones</span>
              </div>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <FileItem key={`${file.name}-${index}`} file={file} index={index} />
                ))}
              </div>

              <div className="flex justify-end mt-12">
                <button
                  onClick={handleUpload}
                  disabled={!selectedVacancyId}
                  className="bg-[#447ECA] text-white px-10 py-3 rounded-2xl font-black text-sm hover:bg-[#356ab0] shadow-xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Subir Archivos
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-center gap-4 animate-fade-in">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black">!</div>
              <div>
                <p className="text-red-600 font-black text-xs uppercase tracking-tight">Aviso</p>
                <p className="text-red-500/80 text-[11px] font-bold italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadCV;