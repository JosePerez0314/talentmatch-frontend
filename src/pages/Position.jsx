import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PillInput from "../components/ui/PillInput";
import PositionSuccess from "../components/Sections/PositionSuccess";

// 1. Constantes fuera del componente para evitar re-renderizados innecesarios
const INITIAL_STATE = {
  role: "", experience: "0", mandatoryTech: [], optionalTech: [],
  softSkills: [], description: "", education: "", languages: [],
};

// 2. Sub-componentes de UI (Clean Code)
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [tempInputs, setTempInputs] = useState({
    mandatoryTech: "", optionalTech: "", softSkills: "", languages: ""
  });

  // --- Lógica de Negocio ---
  const handlePill = (field, val, action, idx) => {
    setFormData(prev => ({
      ...prev,
      [field]: action === 'add'
        ? [...new Set([...prev[field], val.trim()])]
        : prev[field].filter((_, i) => i !== idx)
    }));
    if (action === 'add') setTempInputs(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    ["role", "description"].forEach(f => !formData[f].trim() && (errs[f] = "Obligatorio"));
    ["mandatoryTech", "softSkills"].forEach(f => formData[f].length === 0 && (errs[f] = "Obligatorio"));
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Renderizado condicional para la pantalla de éxito
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
    <div className="p-10 animate-fade-in max-w-5xl mx-auto">

      {/* NUEVO: Botón Volver - Posicionado arriba a la izquierda para navegación rápida */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider">
          Volver
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setHasAttemptedSubmit(true); if (validate()) setIsSuccess(true); }}
        className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100">

        <h1 className="text-2xl font-extrabold mb-10 text-center tracking-tight uppercase">
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
              value={formData.experience}
              onChange={e => setFormData({ ...formData, experience: e.target.value })}>
              <option value="0">Ninguno</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Año{i > 0 ? 's' : ''}
                </option>
              ))}
              <option value="10+">10+ Años</option>
            </select>
          </FormField>
        </FormSection>

        <FormSection title="Habilidades y cualificaciones">
          {[
            { id: "mandatoryTech", label: "Habilidades técnicas obligatorias" },
            { id: "optionalTech", label: "Habilidades técnicas opcionales" },
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
            className="bg-[#447ECA] text-white px-20 py-4 rounded-xl font-extrabold text-[13px] shadow-lg hover:bg-[#3669ab] active:scale-95 transition-all uppercase tracking-wider">
            Crear Posición
          </button>
        </div>
      </form>
    </div>
  );
};

export default Position;