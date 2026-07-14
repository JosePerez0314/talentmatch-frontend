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
        <div className="p-4 md:p-8 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-gray-800">Historial de Posiciones</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {positions.length} posición{positions.length !== 1 ? "es" : ""} registrada{positions.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/position")}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-xl transition-colors"
                    style={{ backgroundColor: '#447ECA' }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
                >
                    <Plus size={14} /> Nueva Posición
                </button>
            </div>

            {error && (
                <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="bg-white rounded-2xl shadow-sm p-10 flex justify-center">
                    <Loader2 className="animate-spin text-[#447ECA]" size={22} />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && positions.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-20 flex flex-col items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: '#DCF9FF' }}
                    >
                        <Briefcase size={24} style={{ color: '#447ECA' }} />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">No hay posiciones creadas</p>
                        <p className="text-gray-400 text-xs">Crea tu primera posición para comenzar a evaluar candidatos.</p>
                    </div>
                    <button
                        onClick={() => navigate("/position")}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm transition-colors"
                        style={{ backgroundColor: '#447ECA' }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
                    >
                        <Plus size={14} /> Crear Posición
                    </button>
                </div>
            )}

            {/* Data container */}
            {!isLoading && positions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                    {/* Tabs */}
                    <div className="border-b border-gray-100 px-4 overflow-x-auto">
                        <div className="flex gap-0 min-w-max">
                            {departmentsList.map((dept) => {
                                const isActive = activeTab === dept;
                                const count = getTabCount(dept);
                                return (
                                    <button
                                        key={dept}
                                        onClick={() => setActiveTab(dept)}
                                        className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                                            isActive
                                                ? 'border-[#447ECA] text-[#447ECA]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                        }`}
                                    >
                                        {dept}
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-full"
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
                        <div className="p-12 text-center text-sm text-gray-400">
                            Sin posiciones en este departamento
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
