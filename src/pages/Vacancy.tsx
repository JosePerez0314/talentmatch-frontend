import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Components
import VacancySuccess from "../components/Sections/VacancySuccess";

//Assets and Services
import { ChevronDown, Calendar, ChevronLeft, AlertCircle } from "lucide-react";
import { vacanciesApi } from "../services/api/vacancies.api";
import { positionService } from "../services/api/positions.api";

// --- TIPADOS ---
interface Position {
  id: number | string;
  role: string;
}

interface Department {
  id: string;
  name: string;
}

interface VacancyFormData {
  departmentId: string;
  positionId: string;
  title: string;
  spots: number;
  openDate: string;
  closeDate: string;
}

// --- MOCK DATA PARA DEPARTAMENTOS ---
// Lo dejamos listo para conectar con la base de datos en el futuro
const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", name: "Tecnología / IT" },
  { id: "2", name: "Ventas" },
  { id: "3", name: "Recursos Humanos" },
  { id: "4", name: "Finanzas & Contabilidad" },
  { id: "5", name: "Operaciones" },
  { id: "6", name: "Marketing" },
  { id: "7", name: "Legal" },
  { id: "8", name: "Customer Success" },
  { id: "9", name: "Producto" },
  { id: "10", name: "Logística" },
];

const CreateVacancy: React.FC = () => {
  const navigate = useNavigate();
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Estados
  const [uiState, setUiState] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [positionsList, setPositionsList] = useState<Position[]>([]);
  const [dateError, setDateError] = useState<string>("");

  const [formData, setFormData] = useState<VacancyFormData>({
    departmentId: "",
    positionId: "",
    title: "",
    spots: 1,
    openDate: "",
    closeDate: ""
  });

  //CARGA DE POSICIONES
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await positionService.getAll();
        const positionsArray = Array.isArray(data) ? data : (data as any)?.data || [];
        setPositionsList(positionsArray);
        
      } catch (error) {
        console.error("Error cargando posiciones:", error);
      }
    };
    fetchPositions();
  }, []);

  //VALIDACION DE FECHAS EN TIEMPO REAL
  const validateDates = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate <= startDate) {
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
      if (name === "openDate" || name === "closeDate") {
        validateDates(newForm.openDate, newForm.closeDate);
      }
      return newForm;
    });
  };

  //MANEJADOR PARA Posico
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const posId = e.target.value;
    const selectedPosition = positionsList.find(p => String(p.id) === posId);
    
    setFormData(prev => ({
      ...prev,
      positionId: posId,
      // auto-completa
      title: selectedPosition ? selectedPosition.role : prev.title
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError || !formData.positionId || !formData.title || !formData.openDate || !formData.closeDate) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const payload = {
        title: formData.title,
        positionId: parseInt(formData.positionId, 10),
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        departmentId: formData.departmentId,
        spots: Number(formData.spots),
        location: "No especificada" 
      };

      //TYPE ASSERTION
      await vacanciesApi.create(payload as unknown as any);

      setUiState("success");
    } catch (error: any) {
      console.error("Error al crear vacante:", error);
      setApiError(error.message || "Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  if (uiState === "success") {
    return <VacancySuccess onReset={() => setUiState("form")} />;
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in relative min-h-[80vh]">
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-[#447ECA] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all text-xs"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          VOLVER AL INICIO
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 w-full max-w-[500px] relative">

          {apiError && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} />
              {apiError}
            </div>
          )}

          <h1 className="text-xl font-medium text-center text-[#1E293B] mb-8">
            Nueva Vacante
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* DEPARTAMENTO    */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600">
                Departamento <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 appearance-none text-sm text-[#334155] cursor-pointer transition-all"
                >
                  <option value="" disabled>Selecciona un departamento...</option>
                  {MOCK_DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* POSICIÓN    */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600">
                Posición <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="positionId"
                  value={formData.positionId}
                  onChange={handlePositionChange}
                  required
                  disabled={!formData.departmentId} //Se habilita al elegir departamento
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 appearance-none text-sm text-[#334155] cursor-pointer transition-all disabled:opacity-50 disabled:bg-gray-50">
                  <option value="" disabled>
                    {formData.departmentId ? "Selecciona una posición..." : "Selecciona un departamento primero..."}
                  </option>
                  {positionsList.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.role}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* TITULO DE LA VACANTE    */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600">
                Título de la Vacante <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Backend Junior..."
                required
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-sm text-[#334155] placeholder:text-gray-300"
              />
            </div>

            {/*  CUPOS DISPONIBLES */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600">
                Cupos Disponibles <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="spots"
                min="1"
                value={formData.spots}
                onChange={handleInputChange}
                required
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#447ECA] focus:ring-4 focus:ring-[#447ECA]/10 transition-all text-sm text-[#334155]"
              />
            </div>

            {/* DATE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[13px] font-medium text-gray-600">
                  Fecha Inicio <span className="text-red-400">*</span>
                </label>
                <div 
                  className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#447ECA] focus-within:ring-4 focus-within:ring-[#447ECA]/10 transition-all cursor-text bg-white" 
                  onClick={() => startDateRef.current?.showPicker()}
                >
                  <input
                    type="date"
                    name="openDate"
                    ref={startDateRef}
                    value={formData.openDate}
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
                <label className="text-[13px] font-medium text-gray-600">
                  Fecha Fin <span className="text-red-400">*</span>
                </label>
                <div 
                  className={`relative flex items-center border rounded-xl overflow-hidden transition-all cursor-text bg-white ${dateError ? "border-red-400 focus-within:ring-red-100 bg-red-50/50" : "border-gray-200 focus-within:border-[#447ECA] focus-within:ring-4 focus-within:ring-[#447ECA]/10"}`} 
                  onClick={() => endDateRef.current?.showPicker()}
                >
                  <input
                    type="date"
                    name="closeDate"
                    ref={endDateRef}
                    value={formData.closeDate}
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

            {/* BUTTOM SUBMIT */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isLoading || !!dateError || !formData.positionId || !formData.title || !formData.openDate || !formData.closeDate}
                className="bg-[#447ECA] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-[#3669ab] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creando..." : "Crear Vacante"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVacancy;