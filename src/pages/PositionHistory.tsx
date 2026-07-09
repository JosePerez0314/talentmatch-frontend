import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyState from "../components/EmptyState";
import PositionHistoryTable from "../components/Sections/PositionHistoryTable";

// Assets & Services & Types
import { ChevronLeft, Plus, AlertCircle } from "lucide-react";
import { positionService } from "../services/api/positions.api";
import { Position } from "../types/api.types";

const PositionHistory: React.FC = () => {
    const navigate = useNavigate();

    // Estados de Conexión y Datos
    const [positions, setPositions] = useState<Position[]>([]);
    const [departmentsList, setDepartmentsList] = useState<string[]>(["Todos"]);
    const [activeTab, setActiveTab] = useState<string>("Todos");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // OBTENER DATA REAL AL MONTAR
    const fetchPositions = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await positionService.getAll();
            const positionsArray = data ?? [];

            setPositions(positionsArray);

            // Generamos las pestañas dinámicamente basados en las posiciones obtenidas
            const uniqueDepts = Array.from(new Set(positionsArray.map((p) => p.department?.name || "General")));
            setDepartmentsList(["Todos", ...uniqueDepts]);
        } catch (err) {
            console.error("Error fetching positions:", err);
            setError("No se pudieron cargar las posiciones desde el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    // HANDLERS DEL CRUD (Eliminar y Duplicar)
    const handleDeletePosition = async (id: number | string) => {
        try {
            await positionService.delete(id);
            // Actualización optimista de UI
            setPositions(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar", error);
            alert("No se pudo eliminar la posición.");
        }
    };

    const handleDuplicatePosition = async (id: number | string) => {
        try {
            // POST /positions/duplicate/:id
            await positionService.duplicate(id);
            // Refrescamos para trae copia generada por el backend
            fetchPositions();
        } catch (error) {
            console.error("Error al duplicar", error);
            alert("No se pudo duplicar la posición.");
        }
    };

    // Lógica de Filtrado
    const filteredPositions = positions.filter(pos => {
        if (activeTab === "Todos") return true;
        const deptName = pos.department?.name || "General";
        return deptName.toLowerCase() === activeTab.toLowerCase();
    });

    const getTabCount = (tab: string) => {
        if (tab === "Todos") return positions.length;
        return positions.filter(pos => (pos.department?.name || "General").toLowerCase() === tab.toLowerCase()).length;
    };

    return (
        <div className="p-10 animate-fade-in max-w-5xl mx-auto flex flex-col min-h-screen text-left relative">
            <div className="flex justify-between items-start mb-8">
                <header className="flex flex-col">
                    <h1 className="text-[26px] font-semibold text-gray-800 tracking-tight mb-1">
                        Historial de Posiciones
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        {positions.length} posiciones registradas en la base de datos
                    </p>
                </header>

                <button
                    onClick={() => navigate("/position")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-[#356BB0] active:scale-95 transition-all text-sm cursor-pointer">
                    <Plus size={16} strokeWidth={2.5} />
                    Nueva Posición
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col relative pb-6">
                
                {/* Tabs Dinamicos */}
                <div className="flex border-b border-gray-100 px-8 pt-5 overflow-x-auto gap-4 custom-scrollbar whitespace-nowrap bg-white select-none">
                    {departmentsList.map((dept) => {
                        const isActive = activeTab === dept;
                        const count = getTabCount(dept);

                        return (
                            <button
                                key={dept}
                                onClick={() => setActiveTab(dept)}
                                className={`pb-4 px-1 text-sm font-medium transition-all relative flex items-center gap-2 cursor-pointer ${isActive ? "text-[#447ECA]" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                {dept}
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive ? "bg-[#DCF9FF] text-[#447ECA]" : "bg-[#f0f0f5] text-gray-500"}`}>
                                    {count}
                                </span>
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#447ECA]" />}
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="py-24 flex items-center justify-center text-gray-400 font-medium">Cargando base de datos...</div>
                ) : filteredPositions.length > 0 ? (
                    <PositionHistoryTable 
                        data={filteredPositions}
                        onDelete={handleDeletePosition} 
                        onDuplicate={handleDuplicatePosition} 
                    />
                ) : (
                    <div className="py-24 flex-grow flex items-center justify-center">
                        <EmptyState title="¡Aún no hay posiciones!" description="Aquí aparecerán las posiciones que crees para la plataforma." />
                    </div>
                )}
            </section>

            <div className="flex justify-start mt-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-[#356BB0] active:scale-95 transition-all text-sm cursor-pointer">
                    <ChevronLeft size={16} strokeWidth={2.5} />
                    Volver al Dashboard
                </button>
            </div>
        </div>
    );
};

export default PositionHistory;