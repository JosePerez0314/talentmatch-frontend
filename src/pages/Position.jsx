import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Componentes
import PillInput from "../components/ui/PillInput";

const Position = () => {
  const navigate = useNavigate();

  // --- Estado de Éxito ---
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Estado del Formulario ---
  const [formData, setFormData] = useState({
    role: "",
    experience: "0",
    mandatoryTech: [],
    optionalTech: [],
    softSkills: [],
    description: "",
    education: "",
    languages: [],
  });

  const [tempInputs, setTempInputs] = useState({
    mandatoryTech: "",
    optionalTech: "",
    softSkills: "",
    languages: "",
  });

  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // --- Lógica de Píldoras ---
  const handleAddPill = (field, value) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[field].includes(trimmedValue)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], trimmedValue],
      }));
      setTempInputs((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const removePill = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // --- Validación ---
  const validateForm = () => {
    const newErrors = {};
    const requiredStrings = ["role", "description"];
    const requiredArrays = ["mandatoryTech", "softSkills"];

    requiredStrings.forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = "Este campo es obligatorio";
    });

    requiredArrays.forEach((field) => {
      if (formData[field].length === 0) newErrors[field] = "Este campo es obligatorio";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (validateForm()) {
      console.log("Formulario válido:", formData);
      // Success Trigger
      setIsSuccess(true);
    }
  };

  // --- Configuraciones de Píldoras (DRY) ---
  const pillConfigs = [
    { label: "Habilidades técnicas obligatorias", id: "mandatoryTech", placeholder: "Ej. React, Tailwind..." },
    { label: "Habilidades técnicas opcionales", id: "optionalTech", placeholder: "Ej. Github, Figma..." },
    { label: "Habilidades blandas", id: "softSkills", placeholder: "Ej. Liderazgo, Empatía..." },
  ];

  // --- RENDERIZADO CONDICIONAL: PANTALLA DE ÉXITO ---
  if (isSuccess) {
    return (
      <div className="p-10 animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
        <div className="max-w-5xl w-full flex flex-col items-center">

          {/* Success Card - 100% Faithful to Dark Design */}
          <div className="bg-[#2D2D2D] w-full max-w-2xl rounded-[40px] p-20 flex flex-col items-center justify-center text-center shadow-2xl mb-10 relative overflow-hidden">
            <div className="flex items-center gap-5 mb-6">
              <h2 className="text-white text-3xl font-bold tracking-tight">
                Posición creada con éxito
              </h2>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#447ECA] text-xl font-bold">✓</span>
              </div>
            </div>
            <p className="text-gray-400 text-lg font-medium">
              "{formData.role}" ha sido agregada al sistema.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex w-full max-w-2xl justify-between items-center px-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 bg-white text-gray-600 px-8 py-4 rounded-2xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <span className="text-xl">←</span>
              Volver al menú
            </button>

            <button
              onClick={() => {
                setIsSuccess(false);
                setFormData({ role: "", experience: "0", mandatoryTech: [], optionalTech: [], softSkills: [], description: "", education: "", languages: [] });
                setHasAttemptedSubmit(false);
              }}
              className="bg-[#447ECA] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-[#356BB0] transition-all active:scale-95"
            >
              Crear otra posición
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO: FORMULARIO PRINCIPAL ---
  return (
    <div className="p-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <form
          onSubmit={handleContinue}
          className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 text-left"
        >
          <h1 className="text-2xl font-extrabold mb-10 text-center tracking-tight uppercase">
            Configuración de Posiciones
          </h1>

          {/* Secciones del formulario (Detalles, Habilidades, etc.) */}
          {/* ... (Tu código de secciones se mantiene igual aquí) ... */}

          <section className="mb-12">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50">
              Detalles del rol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-bold">¿Cuál es el puesto que buscas?</label>
                <input
                  type="text"
                  placeholder="Ej. Senior Frontend Developer"
                  className={`p-4 bg-[#F8F9FA] border rounded-xl outline-none focus:border-[#447ECA] transition-all placeholder:text-gray-400 font-medium ${hasAttemptedSubmit && errors.role ? "border-red-500" : "border-[#D4D4DA]"
                    }`}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                {hasAttemptedSubmit && errors.role && (
                  <span className="text-red-500 text-xs font-bold italic">{errors.role}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold">Años de experiencia</label>
                <div className="relative">
                  <select
                    className="w-full p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none focus:border-[#447ECA] cursor-pointer appearance-none text-gray-600 font-medium"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="0">Ninguno</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Año{i + 1 > 1 ? "s" : ""}
                      </option>
                    ))}
                    <option value="10+">10+ Años</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* --- Renderizado de Píldoras y Resto del Formulario --- */}
          <section className="mb-12 text-left">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50 text-left">
              Habilidades y cualificaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {pillConfigs.map((config) => (
                <PillInput
                  key={config.id}
                  label={config.label}
                  id={config.id}
                  placeholder={config.placeholder}
                  pills={formData[config.id]}
                  tempValue={tempInputs[config.id]}
                  error={errors[config.id]}
                  hasAttemptedSubmit={hasAttemptedSubmit}
                  onAddPill={handleAddPill}
                  onRemovePill={removePill}
                  onChangeTemp={(id, value) => setTempInputs({ ...tempInputs, [id]: value })}
                />
              ))}

              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-bold">Describe el puesto solicitado</label>
                <textarea
                  maxLength={3000}
                  rows={4}
                  placeholder="Escribe aquí las responsabilidades del cargo..."
                  className={`p-4 bg-[#F8F9FA] border rounded-xl outline-none focus:border-[#447ECA] resize-none transition-all placeholder:text-gray-400 font-medium ${hasAttemptedSubmit && errors.description ? "border-red-500" : "border-[#D4D4DA]"
                    }`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="flex justify-between items-center">
                  {hasAttemptedSubmit && errors.description && (
                    <span className="text-red-500 text-xs font-bold italic">{errors.description}</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-extrabold ml-auto uppercase">
                    {formData.description.length} / 3000
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 text-left">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50 text-left">
              Educación e idiomas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-bold">Educación necesaria</label>
                <input
                  type="text"
                  placeholder="Ej. Ingeniería de Software..."
                  className="p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none focus:border-[#447ECA] placeholder:text-gray-400 font-medium"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                />
              </div>

              <PillInput
                label="Idiomas"
                id="languages"
                placeholder="Ej. Inglés C1..."
                pills={formData.languages}
                tempValue={tempInputs.languages}
                error={errors.languages}
                hasAttemptedSubmit={hasAttemptedSubmit}
                onAddPill={handleAddPill}
                onRemovePill={removePill}
                onChangeTemp={(id, value) => setTempInputs({ ...tempInputs, [id]: value })}
              />
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-[#447ECA] text-white px-20 py-4 rounded-xl font-extrabold text-[13px] shadow-lg hover:bg-[#3669ab] active:scale-[0.97] transition-all uppercase tracking-wider"
            >
              Crear Posición
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Position;
