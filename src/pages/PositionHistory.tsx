import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyState from "../components/EmptyState";
import PositionHistoryTable, { PositionData } from "../components/Sections/PositionHistoryTable";

// Assets e Iconos
import { ChevronLeft, Plus } from "lucide-react";

// Data estática exacta de tus pantallas de Figma
const MOCK_POSITIONS: PositionData[] = [
    { id: 1, role: "Cajero", createdAt: "2026-03-15T00:00:00Z", departmentName: "Finanzas" },
    { id: 2, role: "Supervisor de Recursos Humanos", createdAt: "2026-03-15T00:00:00Z", departmentName: "RRHH" },
    { id: 3, role: "Desarrollador Backend Jr", createdAt: "2026-03-15T00:00:00Z", departmentName: "IT" },
    { id: 4, role: "Supervisor de Ventas", createdAt: "2026-03-15T00:00:00Z", departmentName: "Ventas" },
    { id: 5, role: "Conserje", createdAt: "2026-03-15T00:00:00Z", departmentName: "Operaciones" },
    { id: 6, role: "Encargado de Mantenimiento", createdAt: "2026-03-15T00:00:00Z", departmentName: "Operaciones" },
    { id: 7, role: "UX & UI Designer Senior", createdAt: "2026-03-15T00:00:00Z", departmentName: "General" }
];

const DEPARTMENTS = ["Todos", "Finanzas", "General", "IT", "Operaciones", "RRHH", "Ventas"];

const PositionHistory: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("Todos");

    const filteredPositions = MOCK_POSITIONS.filter(pos => {
        if (activeTab === "Todos") return true;
        return pos.departmentName.toLowerCase() === activeTab.toLowerCase();
    });

    const getTabCount = (tab: string) => {
        if (tab === "Todos") return MOCK_POSITIONS.length;
        return MOCK_POSITIONS.filter(pos => pos.departmentName.toLowerCase() === tab.toLowerCase()).length;
    };

    return (
        <div className="p-10 animate-fade-in max-w-5xl mx-auto flex flex-col min-h-screen text-left relative">

            {/* Encabezado Superior con Título y Botón de Nueva Posición alineados */}
            <div className="flex justify-between items-start mb-8">
                <header className="flex flex-col">
                    <h1 className="text-[26px] font-semibold text-gray-800 tracking-tight mb-1">
                        Historial de Posiciones
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        {MOCK_POSITIONS.length} posiciones registradas
                    </p>
                </header>

                <button
                    onClick={() => navigate("/position")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-[#356BB0] active:scale-95 transition-all text-sm cursor-pointer">
                    <Plus size={16} strokeWidth={2.5} />
                    Nueva Posición
                </button>
            </div>

            {/* CONTENEDOR BLANCO PRINCIPAL (Figma Style) */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col relative pb-6">

                {/* Menú de Pestañas (Tabs) integrado en la parte superior interna */}
                <div className="flex border-b border-gray-100 px-8 pt-5 overflow-x-auto gap-4 custom-scrollbar whitespace-nowrap bg-white select-none">
                    {DEPARTMENTS.map((dept) => {
                        const isActive = activeTab === dept;
                        const count = getTabCount(dept);

                        return (
                            <button
                                key={dept}
                                type="button"
                                onClick={() => setActiveTab(dept)}
                                className={`pb-4 px-1 text-sm font-medium transition-all relative flex items-center gap-2 cursor-pointer ${isActive ? "text-[#447ECA]" : "text-gray-400 hover:text-gray-600"
                                    }`}>
                                {dept}
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive ? "bg-[#DCF9FF] text-[#447ECA]" : "bg-[#f0f0f5] text-gray-500"
                                    }`}>
                                    {count}
                                </span>

                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#447ECA]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tabla o Estado Vacío */}
                {filteredPositions.length > 0 ? (
                    <PositionHistoryTable data={filteredPositions} />
                ) : (
                    <div className="py-24 flex-grow flex items-center justify-center">
                        <EmptyState
                            title="¡Aún no hay posiciones!"
                            description="Aquí aparecerán las vacantes que crees para empezar a buscar el match perfecto." />
                    </div>
                )}
            </section>

            {/* Botón Volver discreto en la parte inferior */}
            <div className="flex justify-start mt-6">
                <button
                    type="button"
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