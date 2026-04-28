import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// UI imports
import PillInput from "../components/ui/PillInput";
import PositionSuccess from "../components/Sections/PositionSuccess";
// Services
import { positionService } from "../services/api/positions.api";

const INITIAL_STATE = {
  role: "",
  yearsOfExperience: 0,
  technicalSkills: [],
  optionalTechnicalSkills: [],
  softSkills: [],
  description: "",
  education: "",
  languages: [],
};

// Sub-component UI (Clean Code)
const FormSection = ({ title, children }) => (
  <section className="mb-12 text-left">
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">{children}</div>
  </section>
);

const FormField = ({ label, error, children }) => (
  <div className="flex flex-col gap-2 text-left">
    <label className="text-sm font-bold">{label}</label>
    {children}
    {error && <span className="text-red-500 text-xs font-bold italic">{error}</span>}
  </div>
);

const Position = () => {
  const navigate = useNavigate();

  // State UI
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // State of Data
  const [formData, setFormData] = useState(INITIAL_STATE);

  // Mapped the temporal inputs
  const [tempInputs, setTempInputs] = useState({
    technicalSkills: "", optionalTechnicalSkills: "", softSkills: "", languages: ""
  });

  // --- Business Logic ---
  const handlePill = (field, val, action, idx) => {
    // Prevent the event from propagating if it comes from a keyboard or accidental click
    if (action === 'add') {
      const cleanValue = val?.trim();

      // Early exit if there is no real value
      if (!cleanValue) {
        // Temporary input cleaned in any case to reset the UI
        setTempInputs(prev => ({ ...prev, [field]: "" }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [field]: [...new Set([...prev[field], cleanValue])]
      }));

      // Temporary input reset after successful addition
      setTempInputs(prev => ({ ...prev, [field]: "" }));
    }

    if (action === 'remove') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== idx)
      }));
    }
  };

  const validate = () => {
    const errs = {};
    ["role", "description"].forEach(f => !formData[f].trim() && (errs[f] = "Obligatorio"));
    // Update the validation keys
    ["technicalSkills", "softSkills"].forEach(f => formData[f].length === 0 && (errs[f] = "Obligatorio"));
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Backend Connection ---
  const handleContinue = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setApiError("");

    if (validate()) {
      setIsLoading(true);
      try {
        // Nuestro apiClient.js interceptará esta llamada y le inyectará el Token JWT.
        
        await positionService.create(formData);
        
        setIsSuccess(true);

      } catch (error) {
        console.error("Error creando posición:", error);
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSuccess) return (
    <PositionSuccess
      positionName={formData.role}
      onReset={() => {
        setIsSuccess(false);
        setFormData(INITIAL_STATE);
        setHasAttemptedSubmit(false);
      }}
    />
  );

  return (
    <div className="p-10 animate-fade-in max-w-5xl mx-auto relative">
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider">
          Volver
        </button>
      </div>

      <form
        onSubmit={handleContinue}
        className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 relative">

        {apiError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[80%] bg-red-50 text-red-600 px-6 py-3 rounded-xl border border-red-200 text-sm font-bold text-center animate-fade-in">
            {apiError}
          </div>
        )}

        <h1 className="text-2xl font-extrabold mb-10 text-center tracking-tight uppercase mt-4">
          Configuración de Posiciones
        </h1>

        <FormSection title="Detalles del rol">
          <FormField label="¿Cuál es el puesto que buscas?" error={hasAttemptedSubmit && errors.role}>
            <input
              type="text"
              placeholder="Ej. Senior Frontend"
              className={`p-4 bg-[#F8F9FA] border rounded-xl outline-none focus:border-[#447ECA] font-medium ${errors.role && hasAttemptedSubmit ? "border-red-500" : "border-[#D4D4DA]"}`}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            />
          </FormField>

          <FormField label="Años de experiencia">
            <select
              className="w-full p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none appearance-none font-medium cursor-pointer"
              value={formData.yearsOfExperience}
              // Parse to integer at the moment it changes to keep the state as Int
              onChange={e => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value, 10) || 0 })}>
              <option value="0">Ninguno</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Año{i > 0 ? 's' : ''}
                </option>
              ))}
              <option value="10">10+ Años</option>
            </select>
          </FormField>
        </FormSection>

        <FormSection title="Habilidades y cualificaciones">
          {[
            // IDs to the Prisma keys.
            { id: "technicalSkills", label: "Habilidades técnicas obligatorias" },
            { id: "optionalTechnicalSkills", label: "Habilidades técnicas opcionales" },
            { id: "softSkills", label: "Habilidades blandas" }
          ].map(c => (
            <PillInput
              key={c.id} {...c}
              pills={formData[c.id]}
              tempValue={tempInputs[c.id]}
              error={errors[c.id]}
              hasAttemptedSubmit={hasAttemptedSubmit}
              onAddPill={(id, v) => handlePill(id, v, 'add')}
              onRemovePill={(id, i) => handlePill(id, null, 'remove', i)}
              onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })}
            />
          ))}

          <FormField label="Describe el puesto solicitado" error={hasAttemptedSubmit && errors.description}>
            <textarea
              maxLength={3000}
              rows={4}
              className="p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none focus:border-[#447ECA] resize-none font-medium"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <span className="text-[10px] text-gray-400 font-extrabold ml-auto uppercase">
              {formData.description.length} / 3000
            </span>
          </FormField>
        </FormSection>

        <FormSection title="Educación e idiomas">
          <FormField label="Educación necesaria">
            <input
              type="text"
              className="p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl font-medium"
              value={formData.education}
              onChange={e => setFormData({ ...formData, education: e.target.value })}
            />
          </FormField>
          <PillInput
            label="Idiomas" id="languages"
            pills={formData.languages}
            tempValue={tempInputs.languages}
            onAddPill={(id, v) => handlePill(id, v, 'add')}
            onRemovePill={(id, i) => handlePill(id, null, 'remove', i)}
            onChangeTemp={(id, v) => setTempInputs({ ...tempInputs, [id]: v })}
          />
        </FormSection>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-[#447ECA] text-white px-20 py-4 rounded-xl font-extrabold text-[13px] shadow-lg hover:bg-[#3669ab] active:scale-95 transition-all uppercase tracking-wider ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isLoading ? "Creando..." : "Crear Posición"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Position;