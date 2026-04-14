import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

//Components
import VacancySuccess from "../components/Sections/VacancySuccess";
import EmptyVacancyState from "../components/ui/EmptyVacancyState";

//Assets and Services
import { Icons } from "../assets/icons/index";

const CreateVacancy = () => {
  const navigate = useNavigate();
  
  // Referencias para abrir los calendarios nativos
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // ESTADOS
  const [uiState, setUiState] = useState("form");
  const [formData, setFormData] = useState({
    positionId: "",
    startDate: "",
    endDate: ""
  });
  const [dateError, setDateError] = useState("");

  // Datos simulados (Mock) para el dropdown
  const mockPositions = [
    { id: "1", title: "Supervisor de recursos humanos" },
    { id: "2", title: "Desarrollador Frontend Senior" },
    { id: "3", title: "Analista de Datos" }
  ];

  // VALIDACIÓN DE FECHAS EN TIEMPO REAL
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...formData, [name]: value };
    setFormData(newForm);

    // Si ambos campos tienen valor, validamos
    if (newForm.startDate && newForm.endDate) {
      const start = new Date(newForm.startDate);
      const end = new Date(newForm.endDate);

      if (end <= start) {
        setDateError("La fecha fin debe ser posterior a la fecha de inicio");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prevenir envío si hay error o faltan campos
    if (dateError || !formData.positionId || !formData.startDate || !formData.endDate) {
      return; 
    }
    
    // Aquí irá la llamada a la API en el futuro
    console.log("Datos listos para enviar:", formData);
    
    // Cambiamos a la pantalla de éxito
    setUiState("success");
  };

  // Renderizado Condicional: Pantalla de Éxito
  if (uiState === "success") {
    return <VacancySuccess onReset={() => setUiState("form")} />;
  }

  // Renderizado Normal: Formulario
  return (
    <div className="p-10 max-w-4xl mx-auto animate-fade-in relative">
      {/* Botón Volver (Opcional pero recomendado para UX) */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider"
        >
          Volver
        </button>
      </div>

      {/* Contenedor del Formulario (Centrado estilo Tarjeta) */}
      <div className="flex justify-center">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 w-full max-w-lg">
          <h1 className="text-2xl font-medium text-center text-[#1E293B] mb-8">
            Crear Vacantes
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Campo: Posición ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#475569]">
                Posición ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] appearance-none text-[#334155] cursor-pointer"
                >
                  <option value="" disabled>Seleccionar posición...</option>
                  {mockPositions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
                {/* Flecha personalizada del select */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Fila de Fechas */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Fecha Inicio */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-[#475569]">
                  Fecha Inicio <span className="text-red-500">*</span>
                </label>
                <div 
                  className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#447ECA] transition-colors cursor-text"
                  onClick={() => startDateRef.current?.showPicker()}
                >
                  <input
                    type="date"
                    name="startDate"
                    ref={startDateRef}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    // Ocultamos el icono de calendario nativo feo con CSS inline / clases
                    className="w-full p-3.5 outline-none text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <img 
                    src={Icons.vacancies.calendOpen} 
                    alt="Calendario" 
                    className="absolute right-4 w-5 h-5 opacity-40 cursor-pointer pointer-events-none" 
                  />
                </div>
              </div>

              {/* Fecha Fin */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-[#475569]">
                  Fecha Fin <span className="text-red-500">*</span>
                </label>
                <div 
                  className={`relative flex items-center border rounded-xl overflow-hidden transition-colors cursor-text ${
                    dateError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-[#447ECA]"
                  }`}
                  onClick={() => endDateRef.current?.showPicker()}
                >
                  <input
                    type="date"
                    name="endDate"
                    ref={endDateRef}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 outline-none text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <img 
                    src={Icons.vacancies.calendClose} 
                    alt="Calendario" 
                    className={`absolute right-4 w-5 h-5 cursor-pointer pointer-events-none ${dateError ? "opacity-60" : "opacity-40"}`} 
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de Error en Rojo */}
            {dateError && (
              <p className="text-red-500 text-xs font-medium -mt-2">
                {dateError}
              </p>
            )}

            {/* Botón Submit */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!!dateError || !formData.positionId || !formData.startDate || !formData.endDate}
                className="bg-[#447ECA] text-white px-10 py-3 rounded-xl font-medium shadow-md hover:bg-[#3669ab] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancy;