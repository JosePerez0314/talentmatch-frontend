import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Sparkles, PenLine, UploadCloud, ChevronLeft, ChevronRight, FileText, X, Loader2 } from "lucide-react";

// Components & Services
import PillInput from "../components/ui/PillInput";
import PositionSuccess from "../components/Sections/PositionSuccess";
import { positionService, CreatePositionInput } from "../services/api/positions.api";
import { departmentsApi } from "../services/api/departments.api";
import { ApiError } from "../services/api/apiClient";
import { Department } from "../types/department.types";
import { ApiErrorDetail } from "../types/api.types";

// Convierte los `details` de Zod (400) en un mensaje legible campo por campo.
const formatApiError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (Array.isArray(error.data)) {
      const details = (error.data as ApiErrorDetail[])
        .map(d => `${d.field}: ${d.message}`)
        .join("; ");
      if (details) return `${error.message} — ${details}`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message || fallback : fallback;
};

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
  educationArea: "",
  languages: [],
};

const Position: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = !!editId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESTADOS DEL WIZARD
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [showAiLoader, setShowAiLoader] = useState<boolean>(false);

  // DATOS Y FORMULARIO
  const [formData, setFormData] = useState<CreatePositionInput>(INITIAL_STATE);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [apiError, setApiError] = useState("");

  const [tempInputs, setTempInputs] = useState<Record<string, string>>({
    technicalSkills: "", optionalTechnicalSkills: "", softSkills: "", languages: ""
  });

  // OBTENER DEPARTAMENTOS REALES AL MONTAR
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await departmentsApi.getAll();
        setDepartments(depts);
      } catch (error) {
        console.error("Error al cargar departamentos:", error);
      }
    };
    fetchDepartments();
  }, []);

  // EN MODO EDICIÓN: cargar la posición existente y saltar al paso 2
  useEffect(() => {
    if (!editId) return;
    const fetchPosition = async () => {
      setIsFetchingEdit(true);
      setApiError("");
      try {
        const position = await positionService.getById(editId);
        setFormData({
          departmentId: position.departmentId,
          role: position.role,
          yearsOfExperience: position.yearsOfExperience,
          description: position.description,
          technicalSkills: position.technicalSkills,
          optionalTechnicalSkills: position.optionalTechnicalSkills,
          softSkills: position.softSkills,
          educationLevel: position.educationLevel as string,
          educationArea: position.educationArea ?? "",
          languages: position.languages,
        });
        setEntryMethod("manual");
        setCurrentStep(2);
      } catch (error) {
        setApiError(formatApiError(error, "No se pudo cargar la posición."));
      } finally {
        setIsFetchingEdit(false);
      }
    };
    fetchPosition();
  }, [editId]);

  const handlePill = (field: keyof CreatePositionInput, val: string | null, action: 'add' | 'remove', idx?: number) => {
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
      const response = await positionService.completeWithAI(file);
      const aiData = response as Partial<CreatePositionInput>;

      setFormData(prev => ({
        ...prev,
        role: aiData.role || prev.role,
        yearsOfExperience: aiData.yearsOfExperience ?? prev.yearsOfExperience,
        description: aiData.description || prev.description,
        technicalSkills: aiData.technicalSkills || prev.technicalSkills,
        optionalTechnicalSkills: aiData.optionalTechnicalSkills || prev.optionalTechnicalSkills,
        softSkills: aiData.softSkills || prev.softSkills,
        educationLevel: aiData.educationLevel || prev.educationLevel,
        educationArea: aiData.educationArea ?? prev.educationArea,
        languages: aiData.languages || prev.languages,
      }));

      setIsAiMode(true);
      setCurrentStep(2);
    } catch (error) {
      setApiError(formatApiError(error, "Error al analizar el PDF con la IA."));
    } finally {
      setShowAiLoader(false);
    }
  };

  // VALIDACIÓN DE PASOS
  const validateStep = (step: number) => {
    if (step === 1) return formData.departmentId !== "" && (entryMethod === "manual" || (entryMethod === "ai" && file));
    if (step === 2) return formData.role.trim().length >= 5 && formData.description.trim().length >= 25;
    if (step === 3) return formData.technicalSkills.length > 0 && formData.softSkills.length > 0;
    const areaRequerida = !["NONE", "HIGH_SCHOOL"].includes(formData.educationLevel);
    if (step === 4) return formData.educationLevel !== "" && (!areaRequerida || (formData.educationArea?.trim() ?? "") !== "");
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
        const finalPayload = {
          ...formData,
          departmentId: Number(formData.departmentId),
          yearsOfExperience: Number(formData.yearsOfExperience),
          educationArea: formData.educationArea?.trim() || undefined,
        };
        if (isEditMode && editId) {
          await positionService.update(editId, finalPayload);
        } else {
          await positionService.create(finalPayload as CreatePositionInput);
        }
        setIsSuccess(true);
      } catch (error) {
        setApiError(formatApiError(error, isEditMode ? "Error al actualizar la posición." : "Error al crear la posición."));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepperHeader = () => {
    const steps = ["Método de Entrada", "Detalles del Rol", "Habilidades", "Educación e Idiomas"];
    return (
      <div className="mb-7">
        <div className="flex items-center gap-0">
          {steps.map((_, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <React.Fragment key={stepNum}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-all duration-300 ${isCompleted ? "bg-[#447ECA] text-white" : isActive ? "border-2 text-[#447ECA] bg-white" : "border border-gray-200 text-gray-300 bg-white"}`}
                  style={isActive ? { borderColor: '#447ECA' } : undefined}
                >
                  {isCompleted ? <CheckCircle size={13} /> : stepNum}
                </div>
                {stepNum < steps.length && <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${isCompleted ? "bg-[#447ECA]" : "bg-gray-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Paso {currentStep} de 4: <span className="text-[#447ECA] ml-1">{steps[currentStep - 1]}</span></p>
      </div>
    );
  };

  const renderAiBanner = () => {
    if (!isAiMode) return null;
    return (
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5"
        style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
      >
        <Sparkles size={14} style={{ color: '#447ECA' }} className="flex-shrink-0" />
        <p className="text-xs" style={{ color: '#1E40AF' }}><strong>✨ AI Auto-filled</strong> — Revisa y edita los campos antes de continuar.</p>
      </div>
    );
  };

  if (isFetchingEdit) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-10 flex items-center gap-3 text-gray-500 text-sm">
          <Loader2 className="animate-spin text-[#447ECA]" size={20} />
          Cargando posición...
        </div>
      </div>
    );
  }

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
    return <PositionSuccess positionName={formData.role} isAiGenerated={isAiMode} onReset={() => { setIsSuccess(false); setFormData(INITIAL_STATE); setCurrentStep(1); setIsAiMode(false); setFile(null); setEntryMethod(null); }} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 relative">

        {/* Notificación Global de Error */}
        {apiError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[80%] bg-red-50 text-red-600 px-6 py-3 rounded-xl border border-red-200 text-sm font-bold text-center animate-fade-in">
            {apiError}
          </div>
        )}

        {renderStepperHeader()}

        <div className="mt-4">
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-gray-800 mb-1">Nueva Posición</h2>
                <p className="text-gray-400 text-sm">Selecciona el departamento y elige cómo quieres completar los datos del puesto.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="departmentSelect" className="text-[13px] font-medium text-gray-700">Departamento <span className="text-red-500">*</span></label>
                <select
                  id="departmentSelect"
                  value={formData.departmentId}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#447ECA] text-sm text-[#334155] transition-colors"
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
                  <div onClick={() => setEntryMethod("manual")} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "manual" ? "border-[#447ECA] bg-[#EFF6FF]" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: entryMethod === "manual" ? '#BFDBFE' : '#F0F0F5' }}>
                        <PenLine size={16} style={{ color: entryMethod === "manual" ? '#447ECA' : '#9CA3AF' }} />
                      </div>
                      <div>
                        <p className={`text-sm mb-0.5 ${entryMethod === "manual" ? "text-[#447ECA]" : "text-gray-700"}`}>Completar manualmente</p>
                        <p className="text-xs text-gray-400 leading-relaxed">Ingresa nombre, habilidades y descripción.</p>
                      </div>
                    </div>
                    <div className={`w-full h-0.5 rounded-full mt-4 transition-all ${entryMethod === "manual" ? "bg-[#447ECA]" : "bg-transparent"}`} />
                  </div>
                  <div onClick={() => setEntryMethod("ai")} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${entryMethod === "ai" ? "border-[#447ECA] bg-[#EFF6FF]" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: entryMethod === "ai" ? '#BFDBFE' : '#F0F0F5' }}>
                        <Sparkles size={16} style={{ color: entryMethod === "ai" ? '#447ECA' : '#9CA3AF' }} />
                      </div>
                      <div>
                        <p className={`text-sm mb-0.5 ${entryMethod === "ai" ? "text-[#447ECA]" : "text-gray-700"}`}>Autocompletar con IA</p>
                        <p className="text-xs text-gray-400 leading-relaxed">Sube el PDF y la IA extraerá los campos.</p>
                      </div>
                    </div>
                    <div className={`w-full h-0.5 rounded-full mt-4 transition-all ${entryMethod === "ai" ? "bg-[#447ECA]" : "bg-transparent"}`} />
                  </div>
                </div>
              </div>

              {entryMethod === "ai" && (
                <div className="mt-8 animate-slide-up">
                  {!file ? (
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? "border-[#447ECA] bg-[#EFF6FF]" : "border-gray-200 hover:border-gray-300"}`}>
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
              <h2 className="text-gray-800 mb-5">Detalles del Rol</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nombre del puesto <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Años de experiencia requerida</label>
                    <input type="number" min="0" value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Descripción del puesto <span className="text-red-500">*</span></label>
                    <textarea rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] resize-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-gray-800 mb-5">Habilidades y cualificaciones</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <PillInput label="Habilidades técnicas obligatorias *" id="technicalSkills" theme="green" pills={formData.technicalSkills} tempValue={tempInputs.technicalSkills} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: React, Python..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })} />
                  <PillInput label="Habilidades técnicas opcionales" id="optionalTechnicalSkills" theme="green" pills={formData.optionalTechnicalSkills} tempValue={tempInputs.optionalTechnicalSkills} placeholder="Ej: Figma..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })} />
                  <PillInput label="Habilidades blandas *" id="softSkills" theme="blue" pills={formData.softSkills} tempValue={tempInputs.softSkills} hasAttemptedSubmit={hasAttemptedSubmit} placeholder="Ej: Liderazgo..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-slide-up">
              {renderAiBanner()}
              <h2 className="text-gray-800 mb-5">Educación e Idiomas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">Nivel de educación mínimo <span className="text-red-500">*</span></label>
                    <select value={formData.educationLevel} onChange={e => setFormData({ ...formData, educationLevel: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] transition-colors">
                      <option value="">Selecciona...</option>
                      <option value="NONE">Ninguno</option>
                      <option value="HIGH_SCHOOL">Bachiller</option>
                      <option value="TECHNICAL">Técnico</option>
                      <option value="BACHELOR">Pregrado / Bachiller universitario</option>
                      <option value="UNIVERSITY">Grado Universitario</option>
                      <option value="MASTER">Maestría</option>
                      <option value="DOCTORATE">Doctorado</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-gray-700">
                      Área de estudio
                      {!["NONE", "HIGH_SCHOOL", ""].includes(formData.educationLevel) && <span className="text-red-500"> *</span>}
                    </label>
                    <input type="text" value={formData.educationArea} onChange={e => setFormData({ ...formData, educationArea: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#447ECA] transition-colors" />
                  </div>
                  <PillInput label="Idiomas" id="languages" theme="green" pills={formData.languages} tempValue={tempInputs.languages} placeholder="Ej: Inglés..." onAddPill={(id, v) => handlePill(id as keyof CreatePositionInput, v, 'add')} onRemovePill={(id, i) => handlePill(id as keyof CreatePositionInput, null, 'remove', i)} onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })} />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FOOTER WIZARD */}
      <div className="mt-4 flex items-center justify-between">
        <button
          aria-label="Volver al paso anterior"
          onClick={() => currentStep > 1 ? prevStep() : navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ChevronLeft size={15} /> Atrás
        </button>

        {currentStep === 1 && entryMethod === "ai" && file ? (
          <button
            onClick={processWithAI}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-xl transition-colors"
            style={{ backgroundColor: '#447ECA' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
          >
            <Sparkles size={15} /> Analizar Perfil con IA
          </button>
        ) : currentStep < 4 ? (
          <button
            aria-label="Avanzar al siguiente paso"
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-xl transition-colors"
            style={{ backgroundColor: '#447ECA' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
          >
            Continuar <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmitFinal}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#447ECA' }}
            onMouseOver={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#3a6bb8'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#447ECA'; }}
          >
            {isLoading ? (isEditMode ? "Guardando..." : "Creando...") : (isEditMode ? "Guardar Cambios" : "Crear Posición")} <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Position;