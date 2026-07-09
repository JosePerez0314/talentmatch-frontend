import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Calendar, ChevronLeft, AlertCircle } from "lucide-react";

// Components & API
import VacancySuccess from "../components/Sections/VacancySuccess";
import { vacanciesApi, CreateVacancyInput } from "../services/api/vacancies.api";
import { positionService } from "../services/api/positions.api";
import { departmentsApi } from "../services/api/departments.api";
import { ApiError } from "../services/api/apiClient";
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

// Interfaces internas adaptadas a la API
interface Position {
  id: number | string;
  departmentId: number | string;
  role: string;
}

interface Department {
  id: number | string;
  name: string;
}

const CreateVacancy: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Captura el ID de la URL si estamos editando
  const isEditMode = Boolean(id);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Estados de UI y Datos
  const [uiState, setUiState] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  // Catálogos dinámicos
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [positionsList, setPositionsList] = useState<Position[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    departmentId: "",
    positionId: "",
    title: "",
    availableSlots: 1,
    startDate: "",
    endDate: ""
  });

  // CARGA DE DEPARTAMENTOS Y POSICIONES REALES + DATA DE EDICIÓN
  useEffect(() => {
    const fetchCatalogsAndVacancy = async () => {
      try {
        if (isEditMode) setIsFetchingData(true);

        // 1. Cargar catálogos usando el servicio unificado de departamentos
        const [depts, posRes] = await Promise.all([
          departmentsApi.getAll(),
          positionService.getAll()
        ]);

        const positions = posRes;

        setDepartmentsList(depts);
        setPositionsList(positions);

        // 2. Si es Modo Edición, buscar los datos de la vacante específica
        if (isEditMode && id) {
          const v = await vacanciesApi.getById(id);

          if (v) {
            // Limpieza de ISO string a formato YYYY-MM-DD para los inputs tipo date
            const cleanStartDate = v.startDate ? v.startDate.split("T")[0] : "";
            const cleanEndDate = v.endDate ? v.endDate.split("T")[0] : "";

            // Aseguramos que los IDs sean mapeados como strings para que coincidan con las opciones del select
            const currentDeptId = v.departmentId || v.position?.departmentId || "";
            const currentPosId = v.positionId || v.position?.id || "";

            setFormData({
              departmentId: String(currentDeptId),
              positionId: String(currentPosId),
              title: v.title || "",
              availableSlots: v.availableSlots ? Number(v.availableSlots) : 1,
              startDate: cleanStartDate,
              endDate: cleanEndDate
            });
          }
        }
      } catch (error) {
        console.error("Error cargando catálogos o datos de vacante:", error);
        setApiError("Error al cargar la información necesaria.");
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchCatalogsAndVacancy();
  }, [id, isEditMode]);

  // Lógica de filtrado de posiciones basada en el string del departamento seleccionado
  const filteredPositions = positionsList.filter(p => String(p.departmentId) === formData.departmentId);

  // VALIDACIÓN DE FECHAS EN TIEMPO REAL
  const validateDates = (start: string, end: string) => {
    if (start && end) {
      if (new Date(end) <= new Date(start)) {
        setDateError("La fecha fin debe ser posterior a la fecha de inicio");
        return;
      }
    }
    setDateError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        validateDates(newForm.startDate, newForm.endDate);
      }
      return newForm;
    });
  };

  // AUTO-COMPLETADO INTELIGENTE DEL TÍTULO
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posId = e.target.value;
    const selectedPosition = positionsList.find(p => String(p.id) === posId);

    setFormData(prev => ({
      ...prev,
      positionId: posId,
      title: selectedPosition ? selectedPosition.role : prev.title
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError || !formData.positionId || !formData.title || !formData.startDate || !formData.endDate) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const payload: CreateVacancyInput = {
        title: formData.title,
        availableSlots: Number(formData.availableSlots),
        departmentId: parseInt(formData.departmentId, 10),
        positionId: parseInt(formData.positionId, 10),
        startDate: `${formData.startDate}T00:00:00.000Z`,
        endDate: `${formData.endDate}T23:59:59.000Z`,
        status: "ACTIVE"
      };

      if (isEditMode && id) {
        await vacanciesApi.update(id, payload);
      } else {
        await vacanciesApi.create(payload);
      }

      setUiState("success");

    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} vacante:`, error);
      setApiError(formatApiError(error, `Ocurrió un error al ${isEditMode ? 'actualizar' : 'crear'} la vacante.`));
    } finally {
      setIsLoading(false);
    }
  };

  if (uiState === "success") {
    return (
      <VacancySuccess
        onReset={() => {
          setUiState("form");
          if (isEditMode) {
            navigate("/vacancy-history");
          }
        }}
      />
    );
  }

  if (isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-4">
        <p className="text-gray-500 font-medium tracking-wide animate-pulse">Cargando datos de la vacante...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in relative min-h-[80vh]">
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate(isEditMode ? "/vacancy-history" : "/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all text-xs"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          {isEditMode ? "VOLVER AL HISTORIAL" : "VOLVER AL INICIO"}
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 w-full max-w-[500px] relative">

          {apiError && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <h1 className="text-xl font-medium text-center text-[#1E293B] mb-8">
            {isEditMode ? "Editar Vacante" : "Nueva Vacante"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* DEPARTAMENTO */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="departmentId" className="text-[13px] font-medium text-gray-600">
                Departamento <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, departmentId: e.target.value, positionId: "" }));
                  }}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 appearance-none text-sm text-[#334155] cursor-pointer transition-all"
                >
                  <option value="" disabled>Selecciona un departamento...</option>
                  {departmentsList.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* POSICIÓN FILTRADA */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="positionId" className="text-[13px] font-medium text-gray-600">
                Posición <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="positionId"
                  name="positionId"
                  value={formData.positionId}
                  onChange={handlePositionChange}
                  required
                  disabled={!formData.departmentId}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 appearance-none text-sm text-[#334155] cursor-pointer transition-all disabled:opacity-50 disabled:bg-gray-50">
                  <option value="" disabled>
                    {formData.departmentId
                      ? filteredPositions.length > 0 ? "Selecciona una posición..." : "No hay posiciones en este depto."
                      : "Selecciona un departamento primero..."}
                  </option>
                  {filteredPositions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.role}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* TÍTULO DE LA VACANTE */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-[13px] font-medium text-gray-600">
                Título de la Vacante <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Backend Junior..."
                required
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-sm text-[#334155] placeholder:text-gray-300"
              />
            </div>

            {/* CUPOS DISPONIBLES */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="availableSlots" className="text-[13px] font-medium text-gray-600">
                Cupos Disponibles <span className="text-red-400">*</span>
              </label>
              <input
                id="availableSlots"
                type="number"
                name="availableSlots"
                min="1"
                value={formData.availableSlots}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-sm text-[#334155]"
              />
            </div>

            {/* FECHAS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label htmlFor="startDate" className="text-[13px] font-medium text-gray-600">
                  Fecha Inicio <span className="text-red-400">*</span>
                </label>
                <div
                  className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#447ECA] focus-within:ring-4 focus-within:ring-[#447ECA]/10 transition-all cursor-text bg-white"
                  onClick={() => startDateRef.current?.showPicker()}
                >
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    ref={startDateRef}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 outline-none text-sm text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <div className="absolute right-3 text-gray-400 pointer-events-none">
                    <Calendar size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label htmlFor="endDate" className="text-[13px] font-medium text-gray-600">
                  Fecha Fin <span className="text-red-400">*</span>
                </label>
                <div
                  className={`relative flex items-center border rounded-xl overflow-hidden transition-all cursor-text bg-white ${dateError ? "border-red-400 focus-within:ring-red-100 bg-red-50/50" : "border-gray-200 focus-within:border-[#447ECA] focus-within:ring-4 focus-within:ring-[#447ECA]/10"}`}
                  onClick={() => endDateRef.current?.showPicker()}
                >
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    ref={endDateRef}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 outline-none text-sm text-[#334155] bg-transparent [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <div className={`absolute right-3 pointer-events-none ${dateError ? "text-red-400" : "text-gray-400"}`}>
                    <Calendar size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {dateError && <p className="text-red-500 text-xs font-bold -mt-3">{dateError}</p>}

            {/* BOTÓN SUBMIT DINÁMICO */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading || !!dateError || !formData.positionId || !formData.title || !formData.startDate || !formData.endDate}
                className="bg-[#447ECA] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-[#3669ab] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (isEditMode ? "Guardando..." : "Creando...") : (isEditMode ? "Guardar Cambios" : "Crear Vacante")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancy;