import React, { useState, useRef } from "react";

import { Check, Sparkles, PenLine, UploadCloud, ChevronLeft, ChevronRight, FileText, X } from "lucide-react";

// Components
import PillInput from "../components/ui/PillInput";
import PositionSuccess from "../components/Sections/PositionSuccess";

// TIPADOS
interface PositionFormData {
  departmentId: string;
  role: string;
  yearsOfExperience: number;
  description: string;
  technicalSkills: string[];
  optionalTechnicalSkills: string[];
  softSkills: string[];
  educationLevel: string;
  education: string;
  languages: string[];
}

type EntryMethod = "manual" | "ai" | null;

const INITIAL_STATE: PositionFormData = {
  departmentId: "",
  role: "",
  yearsOfExperience: 0,
  description: "",
  technicalSkills: [],
  optionalTechnicalSkills: [],
  softSkills: [],
  educationLevel: "",
  education: "",
  languages: [],
};

//   MOCK DATA PARA LA IA
const MOCK_AI_RESPONSE: Partial<PositionFormData> = {
  role: "Analista de Datos Senior",
  yearsOfExperience: 3,
  description: "Responsable de recopilar, procesar y analizar grandes volúmenes de datos para apoyar la toma de decisiones estratégicas. Colaborará con equipos de producto e ingeniería.",
  technicalSkills: ["Python", "SQL", "Pandas", "Machine Learning"],
  optionalTechnicalSkills: ["Spark", "Airflow", "Tableau", "Scikit-learn", "TensorFlow"],
  softSkills: ["Pensamiento analítico", "Comunicación de resultados", "Atención al detalle"],
  educationLevel: "Grado Universitario",
  education: "Matemáticas, Estadística o Ciencias de la Computación",
  languages: ["Español", "Inglés"]
};

const Position: React.FC = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  //  STATE DEL WIZARD 
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [showAiLoader, setShowAiLoader] = useState<boolean>(false);
  
  //   DATA STATES AND FORM
  const [formData, setFormData] = useState<PositionFormData>(INITIAL_STATE);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({
    technicalSkills: "", optionalTechnicalSkills: "", softSkills: "", languages: ""
  });

  //   LÓGICA DE PILDORAS 
  const handlePill = (field: keyof PositionFormData, val: string | null, action: 'add'|'remove', idx?: number) => {
    if (action === 'add' && val) {
      const cleanValue = val.trim();
      if (!cleanValue) return setTempInputs(prev => ({ ...prev, [field]: "" }));
      
      setFormData(prev => ({
        ...prev,
        [field]: [...new Set([...(prev[field] as string[]), cleanValue])]
      }));
      setTempInputs(prev => ({ ...prev, [field]: "" }));
    }
    if (action === 'remove' && idx !== undefined) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== idx)
      }));
    }
  };

  //  LOGICA DE DRAG & DROP 
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]?.type === "application/pdf") {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]?.type === "application/pdf") {
      setFile(e.target.files[0]);
    }
  };

  //   SIMULACIÓN DE IA
  const simulateAiAnalysis = () => {
    setShowAiLoader(true);
    // Simula 3 segundos de procesamiento
    setTimeout(() => {
      setFormData(prev => ({ ...prev, ...MOCK_AI_RESPONSE }));
      setIsAiMode(true);
      setShowAiLoader(false);
      setCurrentStep(2);
    }, 3000);
  };

  // --- VALIDACIÓN DE PASOS ---
  const validateStep = (step: number) => {
    if (step === 1) return formData.departmentId !== "" && (entryMethod === "manual" || (entryMethod === "ai" && file));
    if (step === 2) return formData.role.trim() !== "" && formData.description.trim() !== "";
    if (step === 3) return formData.technicalSkills.length > 0 && formData.softSkills.length > 0;
    return true; // 4 se valida al hacer submit final
  };

  const nextStep = () => {
    setHasAttemptedSubmit(true);
    if (validateStep(currentStep)) {
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (validateStep(4)) {
      
      // Simulac de envío exitoso a API
      console.log("Enviando:", formData);
      setIsSuccess(true);
    }
  };

  // RENDERIZADORES DE UI

  const renderStepperHeader = () => {
    const steps = ["Método de Entrada", "Detalles del Rol", "Habilidades", "Educación e Idiomas"];
    
    return (
      <div className="mb-10 w-full">
        {/* Contenedor Flex principal para Círculos y Líneas */}
        <div className="flex items-center w-full mb-6">
          {steps.map((_, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <React.Fragment key={stepNum}>
                {/* 1. EL CÍRCULO */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-[#447ECA] text-white border-[2px] border-[#447ECA]" // Pasos completados (Azul sólido)
                      : isActive 
                      ? "bg-white border-[2px] border-[#447ECA] text-[#447ECA]" // Paso actual (Aro azul)
                      : "bg-white border-[2px] border-gray-200 text-gray-300"   // Pasos futuros (Aro gris)
                  }`}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                </div>

                {/* 2. LA LÍNEA CONECTORA (Se omite después del último círculo) */}
                {stepNum < steps.length && (
                  <div 
                    className={`flex-1 h-[2px] mx-3 transition-all duration-300 rounded-full ${
                      isCompleted ? "bg-[#447ECA]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* 3. SUBTÍTULO DINÁMICO */}
        <p className="text-[13px] text-gray-400 font-medium">
          Paso {currentStep} de 4: <span className="text-[#447ECA] ml-1">{steps[currentStep - 1]}</span>
        </p>
      </div>
    );
  };
  const renderAiBanner = () => {
    if (!isAiMode) return null;
    return (
      <div className="bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-4 flex items-center gap-3 mb-8">
        <Sparkles className="text-[#447ECA]" size={20} />
        <p className="text-sm text-[#447ECA] font-medium">
          <strong className="mr-1">AI Auto-filled —</strong> Revisa y edita los campos antes de continuar. Todo el contenido fue generado a partir del perfil de puesto que subiste.
        </p>
      </div>
    );
  };

  //VIEWS BY STEP (Pasos)

  if (showAiLoader) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#F2F4F7]/80 backdrop-blur-md animate-fade-in p-4">
        <div className="bg-[#313131] w-full max-w-[600px] h-[350px] rounded-[32px] flex flex-col items-center justify-center shadow-2xl p-10 relative overflow-hidden">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <FileText className="text-[#447ECA]" size={28} />
          </div>
          <h2 className="text-white text-2xl font-medium mb-3">Analizando perfil de puesto...</h2>
          <p className="text-gray-400 text-sm mb-10">La IA está extrayendo habilidades, requisitos y descripción del PDF.</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#447ECA] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-[#447ECA] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-[#447ECA] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return <PositionSuccess positionName={formData.role} isAiGenerated={isAiMode} onReset={() => {
      setIsSuccess(false); setFormData(INITIAL_STATE); setCurrentStep(1); setIsAiMode(false); setFile(null); setEntryMethod(null);
    }}/>;
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-5xl mx-auto min-h-screen flex flex-col">
      <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 flex-1 flex flex-col">
        
        {renderStepperHeader()}

        <div className="flex-1">
          {/* 1 INPUT METHOD  */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h1 className="text-2xl font-medium text-gray-900 mb-1">Nueva Posición</h1>
                <p className="text-gray-400 text-sm">Selecciona el departamento y elige cómo quieres completar los datos del puesto.</p>
              </div>

              <div className="flex flex-col gap-2 max-w-xl">
                <label className="text-[13px] font-medium text-gray-700">Departamento <span className="text-red-500">*</span></label>
                <select
                  value={formData.departmentId}
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 text-sm text-[#334155]"
                >
                  <option value="" disabled>Selecciona un departamento...</option>
                  <option value="1">Ventas</option>
                  <option value="2">Tecnología / IT</option>
                </select>
                {hasAttemptedSubmit && !formData.departmentId && <span className="text-red-500 text-xs">Requerido</span>}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-medium text-gray-700">Método de ingreso de datos</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Manual */}
                  <div 
                    onClick={() => setEntryMethod("manual")}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "manual" ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entryMethod === "manual" ? "bg-[#447ECA] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <PenLine size={18} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${entryMethod === "manual" ? "text-[#447ECA]" : "text-gray-700"}`}>Completar manualmente</h3>
                        <p className="text-xs text-gray-400 mt-1">Ingresa nombre, habilidades y descripción paso a paso.</p>
                      </div>
                    </div>
                  </div>
                  {/* AI */}
                  <div 
                    onClick={() => setEntryMethod("ai")}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "ai" ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entryMethod === "ai" ? "bg-[#447ECA] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${entryMethod === "ai" ? "text-[#447ECA]" : "text-gray-700"}`}>Autocompletar con IA</h3>
                        <p className="text-xs text-gray-400 mt-1">Sube el perfil del puesto en PDF y la IA extraerá los campos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ZONE Drag & Drop */}
              {entryMethod === "ai" && (
                <div className="mt-8 animate-slide-up">
                  {!file ? (
                    <div 
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <UploadCloud className="text-gray-400 mb-3" size={32} />
                      <p className="text-sm text-[#447ECA] font-medium mb-1">Haz clic para subir <span className="text-gray-500 font-normal">o arrastra el archivo aquí</span></p>
                      <p className="text-xs text-gray-400">Solo archivos PDF — máx. 10 MB</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="text-[#447ECA]" size={20} />
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                      </div>
                    </div>
                  )}
                  {hasAttemptedSubmit && !file && <span className="text-red-500 text-xs mt-2 block">Debes subir un archivo para continuar con IA.</span>}
                </div>
              )}
            </div>
          )}

          {/* 2 ROLE DETAILS  */}
          {currentStep === 2 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Detalles del Rol</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  {/* Fields */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Departamento <span className="text-red-500">*</span></label>
                    <select disabled value={formData.departmentId} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                      <option value="1">Ventas</option>
                      <option value="2">Tecnología / IT</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nombre del puesto <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10" />
                    {hasAttemptedSubmit && !formData.role && <span className="text-red-500 text-xs">Obligatorio</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Años de experiencia requerida</label>
                    <input type="number" min="0" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: Number(e.target.value)})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Descripción del puesto <span className="text-red-500">*</span></label>
                    <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 resize-none" />
                    {hasAttemptedSubmit && !formData.description && <span className="text-red-500 text-xs">Obligatorio</span>}
                  </div>
                </div>
                {/* Info Sidebar */}
                <div className="bg-[#F8F9FA] rounded-2xl p-6 h-fit border border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Guía de campos</h3>
                  <div className="space-y-5">
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Nombre del puesto</h4><p className="text-xs text-gray-500 leading-relaxed">Usa el título exacto del rol como aparece en tu org chart. Evita abreviaciones.</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Años de experiencia</h4><p className="text-xs text-gray-500 leading-relaxed">Define el mínimo aceptable. El sistema filtrará candidatos por debajo de este umbral.</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4><p className="text-xs text-gray-500 leading-relaxed">Incluye responsabilidades principales, el equipo con el que colaborará y el impacto esperado del rol.</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*  3 SKILLS */}
          {currentStep === 3 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Habilidades y cualificaciones</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <PillInput label="Habilidades técnicas obligatorias *" id="technicalSkills" theme="green" pills={formData.technicalSkills} tempValue={tempInputs.technicalSkills} error={hasAttemptedSubmit && formData.technicalSkills.length === 0 ? "Agrega al menos una" : ""} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: React, Python..." onAddPill={(id, v) => handlePill(id as keyof PositionFormData, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof PositionFormData, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                  <PillInput label="Habilidades técnicas opcionales" id="optionalTechnicalSkills" theme="green" pills={formData.optionalTechnicalSkills} tempValue={tempInputs.optionalTechnicalSkills} placeholder="Ej: Figma, Docker..." onAddPill={(id, v) => handlePill(id as keyof PositionFormData, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof PositionFormData, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                  <PillInput label="Habilidades blandas *" id="softSkills" theme="blue" pills={formData.softSkills} tempValue={tempInputs.softSkills} error={hasAttemptedSubmit && formData.softSkills.length === 0 ? "Agrega al menos una" : ""} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: Liderazgo, Comunicación..." onAddPill={(id, v) => handlePill(id as keyof PositionFormData, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof PositionFormData, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                </div>
                <div className="bg-[#F8F9FA] rounded-2xl p-6 h-fit border border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Guía de campos</h3>
                  <div className="space-y-5">
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Skills obligatorias</h4><p className="text-xs text-gray-500 leading-relaxed">Son criterios de eliminación. Si el candidato no las tiene, su score bajará drásticamente.</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Skills opcionales</h4><p className="text-xs text-gray-500 leading-relaxed">Suman puntos al score pero no penalizan si faltan.</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Soft skills</h4><p className="text-xs text-gray-500 leading-relaxed">La IA las busca en el contexto del CV. Sé específico para mejores resultados.</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 EDUCATION E LANGUAJE */}
          {currentStep === 4 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Educación e Idiomas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nivel de educación mínimo requerido <span className="text-red-500">*</span></label>
                    <select value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10">
                      <option value="">Selecciona el nivel académico...</option>
                      <option value="Ninguno">Ninguno / No requerido</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Grado Universitario">Grado Universitario</option>
                      <option value="Maestría">Maestría</option>
                    </select>
                    {hasAttemptedSubmit && !formData.educationLevel && <span className="text-red-500 text-xs">Obligatorio</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Área de estudio específica <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} placeholder="Ej. Ingeniería de Software" className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10" />
                    {hasAttemptedSubmit && !formData.education && <span className="text-red-500 text-xs">Obligatorio</span>}
                  </div>
                  <PillInput label="Idiomas" id="languages" theme="green" pills={formData.languages} tempValue={tempInputs.languages} placeholder="Ej: Español, Inglés Avanzado..." onAddPill={(id, v) => handlePill(id as keyof PositionFormData, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof PositionFormData, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                </div>
                <div className="bg-[#F8F9FA] rounded-2xl p-6 h-fit border border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Guía de campos</h3>
                  <div className="space-y-5">
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Nivel académico</h4><p className="text-xs text-gray-500 leading-relaxed">Define el piso mínimo. Si el rol no requiere título, elige "Ninguno".</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Área de estudio</h4><p className="text-xs text-gray-500 leading-relaxed">Indica la carrera esperada. Usa "o afín" para ampliar el criterio.</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700 mb-1">Idiomas</h4><p className="text-xs text-gray-500 leading-relaxed">Agrega los idiomas funcionales. Puedes incluir el nivel (ej: "Inglés B2").</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER WIZARD */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm">
              <ChevronLeft size={18} /> Atrás
            </button>
          ) : (
             <div />
          )}

          {currentStep === 1 && entryMethod === "ai" && file ? (
            <button onClick={simulateAiAnalysis} className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3669ab] transition-colors shadow-sm active:scale-95 text-sm">
              <Sparkles size={18} /> Analizar Perfil con IA
            </button>
          ) : currentStep < 4 ? (
            <button onClick={nextStep} className="flex items-center gap-2 bg-[#A4BDE4] hover:bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm active:scale-95 text-sm">
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmitFinal} className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3669ab] transition-colors shadow-sm active:scale-95 text-sm">
              Crear Posición <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Position;