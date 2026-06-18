import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, PenLine, UploadCloud, ChevronLeft, ChevronRight, FileText, X } from "lucide-react";

// Components & Services
import PillInput from "../components/ui/PillInput";
import PositionSuccess from "../components/Sections/PositionSuccess";
import { positionService, CreatePositionInput } from "../services/api/positions.api";
import { apiClient } from "../services/api/apiClient"; // Para obtener departamentos

type EntryMethod = "manual" | "ai" | null;

const INITIAL_STATE: CreatePositionInput = {
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

const Position: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESTADOS DEL WIZARD
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [showAiLoader, setShowAiLoader] = useState<boolean>(false);
  
  // DATOS Y FORMULARIO
  const [formData, setFormData] = useState<CreatePositionInput>(INITIAL_STATE);
  const [departments, setDepartments] = useState<any[]>([]); // Lista real de BD
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [apiError, setApiError] = useState("");
  
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({
    technicalSkills: "", optionalTechnicalSkills: "", softSkills: "", languages: ""
  });

  // OBTENER DEPARTAMENTOS REALES AL MONTAR
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient('/departments', { method: 'GET' });
        const dataArray = Array.isArray(res) ? res : (res as any)?.data || [];
        setDepartments(dataArray);
      } catch (error) {
        console.error("Error al cargar departamentos:", error);
      }
    };
    fetchDepartments();
  }, []);

  const handlePill = (field: keyof CreatePositionInput, val: string | null, action: 'add'|'remove', idx?: number) => {
    if (action === 'add' && val) {
      const cleanValue = val.trim();
      if (!cleanValue) return setTempInputs(prev => ({ ...prev, [field]: "" }));
      setFormData(prev => ({ ...prev, [field]: [...new Set([...(prev[field] as string[]), cleanValue])] }));
      setTempInputs(prev => ({ ...prev, [field]: "" }));
    }
    if (action === 'remove' && idx !== undefined) {
      setFormData(prev => ({ ...prev, [field]: (prev[field] as string[]).filter((_, i) => i !== idx) }));
    }
  };

  // DRAG & DROP
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]?.type === "application/pdf") setFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]?.type === "application/pdf") setFile(e.target.files[0]);
  };

  // CONEXION REAL DE LA IA (PDF EXTRACT)
  const processWithAI = async () => {
    if (!file) return;
    setShowAiLoader(true);
    setApiError("");
    
    try {
      // POST /positions/complete
      const response = await positionService.completeWithAI(file);
      const aiData = response as Partial<CreatePositionInput>; 

      setFormData(prev => ({
        ...prev,
        role: aiData.role || prev.role,
        yearsOfExperience: aiData.yearsOfExperience || prev.yearsOfExperience,
        description: aiData.description || prev.description,
        technicalSkills: aiData.technicalSkills || prev.technicalSkills,
        optionalTechnicalSkills: aiData.optionalTechnicalSkills || prev.optionalTechnicalSkills,
        softSkills: aiData.softSkills || prev.softSkills,
        educationLevel: aiData.educationLevel || prev.educationLevel,
        education: aiData.education || prev.education,
        languages: aiData.languages || prev.languages,
      }));
      
      setIsAiMode(true);
      setCurrentStep(2);
    } catch (error: any) {
      setApiError(error.message || "Error al analizar el PDF con la IA.");
    } finally {
      setShowAiLoader(false);
    }
  };

  // VALIDACIÓN DE PASOS
  const validateStep = (step: number) => {
    if (step === 1) return formData.departmentId !== "" && (entryMethod === "manual" || (entryMethod === "ai" && file));
    if (step === 2) return formData.role.trim() !== "" && formData.description.trim() !== "";
    if (step === 3) return formData.technicalSkills.length > 0 && formData.softSkills.length > 0;
    return true; 
  };

  const nextStep = () => {
    setHasAttemptedSubmit(true);
    setApiError("");
    if (validateStep(currentStep)) {
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // CONEXION SUBMIT
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setApiError("");

    if (validateStep(4)) {
      setIsLoading(true);
      try {
        // Formateamos si es necesario para el backend
        const finalPayload = {
            ...formData,
            departmentId: Number(formData.departmentId),
            yearsOfExperience: Number(formData.yearsOfExperience)
        };
        // POST /positions
        await positionService.create(finalPayload as CreatePositionInput);
        setIsSuccess(true);
      } catch (error: any) {
        setApiError(error.message || "Error al crear la posición.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepperHeader = () => {
    const steps = ["Método de Entrada", "Detalles del Rol", "Habilidades", "Educación e Idiomas"];
    return (
      <div className="mb-10 w-full">
        <div className="flex items-center w-full mb-6">
          {steps.map((_, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <React.Fragment key={stepNum}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${isCompleted ? "bg-[#447ECA] text-white border-[2px] border-[#447ECA]" : isActive ? "bg-white border-[2px] border-[#447ECA] text-[#447ECA]" : "bg-white border-[2px] border-gray-200 text-gray-300"}`}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                </div>
                {stepNum < steps.length && <div className={`flex-1 h-[2px] mx-3 transition-all duration-300 rounded-full ${isCompleted ? "bg-[#447ECA]" : "bg-gray-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-[13px] text-gray-400 font-medium">Paso {currentStep} de 4: <span className="text-[#447ECA] ml-1">{steps[currentStep - 1]}</span></p>
      </div>
    );
  };

  const renderAiBanner = () => {
    if (!isAiMode) return null;
    return (
      <div className="bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-4 flex items-center gap-3 mb-8">
        <Sparkles className="text-[#447ECA]" size={20} />
        <p className="text-sm text-[#447ECA] font-medium"><strong className="mr-1">AI Auto-filled —</strong> Revisa y edita los campos antes de continuar.</p>
      </div>
    );
  };

  if (showAiLoader) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#F2F4F7]/80 backdrop-blur-md animate-fade-in p-4">
        <div className="bg-[#313131] w-full max-w-[600px] h-[350px] rounded-[32px] flex flex-col items-center justify-center shadow-2xl p-10 relative overflow-hidden">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><FileText className="text-[#447ECA]" size={28} /></div>
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
    return <PositionSuccess positionName={formData.role} isAiGenerated={isAiMode} onReset={() => { setIsSuccess(false); setFormData(INITIAL_STATE); setCurrentStep(1); setIsAiMode(false); setFile(null); setEntryMethod(null); }}/>;
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-5xl mx-auto min-h-screen flex flex-col">
      <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 flex-1 flex flex-col relative">
        
        {/* Notificación Global de Error */}
        {apiError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[80%] bg-red-50 text-red-600 px-6 py-3 rounded-xl border border-red-200 text-sm font-bold text-center animate-fade-in">
            {apiError}
          </div>
        )}

        {renderStepperHeader()}

        <div className="flex-1 mt-4">
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
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {hasAttemptedSubmit && !formData.departmentId && <span className="text-red-500 text-xs">Requerido</span>}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-medium text-gray-700">Método de ingreso de datos</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div onClick={() => setEntryMethod("manual")} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "manual" ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entryMethod === "manual" ? "bg-[#447ECA] text-white" : "bg-gray-100 text-gray-500"}`}><PenLine size={18} /></div>
                      <div><h3 className={`font-medium ${entryMethod === "manual" ? "text-[#447ECA]" : "text-gray-700"}`}>Completar manualmente</h3><p className="text-xs text-gray-400 mt-1">Ingresa nombre, habilidades y descripción.</p></div>
                    </div>
                  </div>
                  <div onClick={() => setEntryMethod("ai")} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "ai" ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entryMethod === "ai" ? "bg-[#447ECA] text-white" : "bg-gray-100 text-gray-500"}`}><Sparkles size={18} /></div>
                      <div><h3 className={`font-medium ${entryMethod === "ai" ? "text-[#447ECA]" : "text-gray-700"}`}>Autocompletar con IA</h3><p className="text-xs text-gray-400 mt-1">Sube el PDF y la IA extraerá los campos.</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {entryMethod === "ai" && (
                <div className="mt-8 animate-slide-up">
                  {!file ? (
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? "border-[#447ECA] bg-[#F0F7FF]" : "border-gray-200 hover:border-gray-300"}`}>
                      <UploadCloud className="text-gray-400 mb-3" size={32} />
                      <p className="text-sm text-[#447ECA] font-medium mb-1">Haz clic para subir <span className="text-gray-500 font-normal">o arrastra el archivo aquí</span></p>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl">
                      <div className="flex items-center gap-3"><FileText className="text-[#447ECA]" size={20} /><span className="text-sm font-medium text-gray-700">{file.name}</span></div>
                      <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Detalles del Rol</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nombre del puesto <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Años de experiencia requerida</label>
                    <input type="number" min="0" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: Number(e.target.value)})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Descripción del puesto <span className="text-red-500">*</span></label>
                    <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA] resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Habilidades y cualificaciones</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <PillInput label="Habilidades técnicas obligatorias *" id="technicalSkills" theme="green" pills={formData.technicalSkills} tempValue={tempInputs.technicalSkills} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: React, Python..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                  <PillInput label="Habilidades técnicas opcionales" id="optionalTechnicalSkills" theme="green" pills={formData.optionalTechnicalSkills} tempValue={tempInputs.optionalTechnicalSkills} placeholder="Ej: Figma..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                  <PillInput label="Habilidades blandas *" id="softSkills" theme="blue" pills={formData.softSkills} tempValue={tempInputs.softSkills} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: Liderazgo..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-xl font-medium text-gray-900 mb-8">Educación e Idiomas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nivel de educación mínimo <span className="text-red-500">*</span></label>
                    <select value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA]">
                      <option value="">Selecciona...</option>
                      <option value="Ninguno">Ninguno</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="Grado Universitario">Grado Universitario</option>
                      <option value="Maestría">Maestría</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Área de estudio <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#447ECA]" />
                  </div>
                  <PillInput label="Idiomas" id="languages" theme="green" pills={formData.languages} tempValue={tempInputs.languages} placeholder="Ej: Inglés..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({...tempInputs, [id]: v})} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER WIZARD */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button onClick={() => currentStep > 1 ? prevStep() : navigate("/dashboard")} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm">
            <ChevronLeft size={18} /> Atrás
          </button>

          {currentStep === 1 && entryMethod === "ai" && file ? (
            <button onClick={processWithAI} className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3669ab] transition-colors shadow-sm active:scale-95 text-sm">
              <Sparkles size={18} /> Analizar Perfil con IA
            </button>
          ) : currentStep < 4 ? (
            <button onClick={nextStep} className="flex items-center gap-2 bg-[#A4BDE4] hover:bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm active:scale-95 text-sm">
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmitFinal} disabled={isLoading} className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3669ab] transition-colors shadow-sm active:scale-95 text-sm disabled:opacity-50">
              {isLoading ? "Creando..." : "Crear Posición"} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Position;