import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PositionHistoryTable from "../components/Sections/PositionHistoryTable";

import { Plus, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { positionService } from "../services/api/positions.api";
import { Position } from "../types/api.types";

const PositionHistory: React.FC = () => {
    const navigate = useNavigate();

    const [positions, setPositions] = useState<Position[]>([]);
    const [departmentsList, setDepartmentsList] = useState<string[]>(["Todos"]);
    const [activeTab, setActiveTab] = useState<string>("Todos");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchPositions = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await positionService.getAll();
            const positionsArray = data ?? [];
            setPositions(positionsArray);
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

    const handleDeletePosition = async (id: number | string) => {
        try {
            setError("");
            await positionService.delete(id);
            setPositions(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar", err);
            setError("No se pudo eliminar la posición.");
        }
    };

    const handleDuplicatePosition = async (id: number | string) => {
        try {
            setError("");
            await positionService.duplicate(id);
            fetchPositions();
        } catch (err) {
            console.error("Error al duplicar", err);
            setError("No se pudo duplicar la posición.");
        }
    };

    const filteredPositions = positions.filter(pos => {
        if (activeTab === "Todos") return true;
        return (pos.department?.name || "General").toLowerCase() === activeTab.toLowerCase();
    });

    const getTabCount = (tab: string) => {
        if (tab === "Todos") return positions.length;
        return positions.filter(pos => (pos.department?.name || "General").toLowerCase() === tab.toLowerCase()).length;
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">

            {/* Header Responsivo  */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Posiciones</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        {positions.length} posición{positions.length !== 1 ? "es" : ""} registrada{positions.length !== 1 ? "s" : ""} en total
                    </p>
                </div>
                <button
                    onClick={() => navigate("/position")}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm flex-shrink-0 bg-[#447ECA] hover:bg-[#3669ab]"
                >
                    <Plus size={16} /> Nueva Posición
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-700 px-5 py-4 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-3 shadow-sm">
                    <AlertCircle size={18} className="flex-shrink-0" /> {error}
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex justify-center">
                    <Loader2 className="animate-spin text-[#447ECA]" size={32} />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && positions.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 md:p-16 flex flex-col items-center gap-5 text-center mt-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#DCF9FF]">
                        <Briefcase size={28} className="text-[#447ECA]" />
                    </div>
                    <div>
                        <p className="text-gray-900 text-lg font-bold mb-1.5">No hay posiciones creadas</p>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Crea tu primera posición para comenzar a evaluar y clasificar candidatos mediante IA.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/position")}
                        className="mt-2 flex items-center gap-2 px-6 py-3 font-bold text-white rounded-xl text-sm transition-all shadow-sm bg-[#447ECA] hover:bg-[#3669ab]"
                    >
                        <Plus size={16} /> Crear Posición
                    </button>
                </div>
            )}

            {/* Data container */}
            {!isLoading && positions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Tabs Responsivos con scroll oculto */}
                    <div className="border-b border-gray-100 px-2 sm:px-4 overflow-x-auto custom-scrollbar">
                        <div className="flex gap-2 min-w-max">
                            {departmentsList.map((dept) => {
                                const isActive = activeTab === dept;
                                const count = getTabCount(dept);
                                return (
                                    <button
                                        key={dept}
                                        onClick={() => setActiveTab(dept)}
                                        className={`flex items-center gap-2.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'border-[#447ECA] text-[#447ECA]'
                                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                                        }`}
                                    >
                                        {dept}
                                        <span
                                            className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                                            style={{
                                                backgroundColor: isActive ? '#DCF9FF' : '#F3F4F6',
                                                color: isActive ? '#447ECA' : '#6B7280',
                                            }}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {filteredPositions.length === 0 ? (
                        <div className="p-16 text-center text-sm font-medium text-gray-400">
                            Sin posiciones asignadas a este departamento.
                        </div>
                    ) : (
                        <PositionHistoryTable
                            data={filteredPositions}
                            onDelete={handleDeletePosition}
                            onDuplicate={handleDuplicatePosition}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PositionHistory;