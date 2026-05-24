import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Components
import VacancySuccess from "../components/Sections/VacancySuccess";
import EmptyVacancyState from "../components/ui/EmptyVacancyState";

//Assets and Services
import { Icons } from "../assets/icons/index";
import { vacanciesApi } from "../services/api/vacancies.api";
import { positionService } from "../services/api/positions.api";

const CreateVacancy = () => {
  const navigate = useNavigate();
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Estados
  const [uiState, setUiState] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [positionsList, setPositionsList] = useState([]);
  const [dateError, setDateError] = useState("");

  const [formData, setFormData] = useState({
    positionId: "",
    openDate: "",
    closeDate: ""
  });

  // LOAD REAL POSITIONS WHEN MOUNTING
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await positionService.getAll();
        setPositionsList(data || []);
      } catch (error) {
        console.error("Error cargando posiciones:", error);
      }
    };
    fetchPositions();
  }, []);

  // DATE VALIDATION
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...formData, [name]: value };
    setFormData(newForm);

    if (newForm.openDate && newForm.closeDate) {
      const start = new Date(newForm.openDate);
      const end = new Date(newForm.closeDate);

      if (end <= start) {
        setDateError("La fecha fin debe ser posterior a la fecha de inicio");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError || !formData.positionId || !formData.openDate || !formData.closeDate) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Role of the position for the vacancy title
      const positionObj = positionsList.find(p => p.id === parseInt(formData.positionId));
      const vacancyTitle = positionObj ? `Vacante para ${positionObj.role}` : "Nueva Vacante";

      const payload = {
        title: vacancyTitle,
        positionId: parseInt(formData.positionId, 10),
        openDate: formData.openDate,
        closeDate: formData.closeDate
      };

      // POST request
      await vacanciesApi.create(payload);

      setUiState("success");
    } catch (error) {
      console.error("Error al crear vacante:", error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (uiState === "success") {
    return <VacancySuccess onReset={() => setUiState("form")} />;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto animate-fade-in relative">
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider"
        >
          Volver
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 w-full max-w-lg relative">

          {apiError && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm font-bold text-center">
              {apiError}
            </div>
          )}

          <h1 className="text-2xl font-medium text-center text-[#1E293B] mb-8">
            Crear Vacantes
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                  {positionsList.map(pos => (
                    <option key={pos.id} value={pos.id}>
                      {pos.role}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-[#475569]">
                  Fecha Inicio <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#447ECA] transition-colors cursor-text" onClick={() => startDateRef.current?.showPicker()}>
                  <input
                    type="date"
                    name="openDate"
                    ref={startDateRef}
                    value={formData.openDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 outline-none text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <img src={Icons.vacancies.calendOpen} alt="Calendario" className="absolute right-4 w-5 h-5 opacity-40 cursor-pointer pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-[#475569]">
                  Fecha Fin <span className="text-red-500">*</span>
                </label>
                <div className={`relative flex items-center border rounded-xl overflow-hidden transition-colors cursor-text ${dateError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-[#447ECA]"}`} onClick={() => endDateRef.current?.showPicker()}>
                  <input
                    type="date"
                    name="closeDate"
                    ref={endDateRef}
                    value={formData.closeDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 outline-none text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <img src={Icons.vacancies.calendClose} alt="Calendario" className={`absolute right-4 w-5 h-5 cursor-pointer pointer-events-none ${dateError ? "opacity-60" : "opacity-40"}`} />
                </div>
              </div>
            </div>

            {dateError && <p className="text-red-500 text-xs font-medium -mt-2">{dateError}</p>}

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading || !!dateError || !formData.positionId || !formData.openDate || !formData.closeDate}
                className="bg-[#447ECA] text-white px-10 py-3 rounded-xl font-medium shadow-md hover:bg-[#3669ab] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancy;