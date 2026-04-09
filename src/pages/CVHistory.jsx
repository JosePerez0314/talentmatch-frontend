import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. IMPORTANTE: Importar el hook
import EmptyState from "../components/EmptyState";
import HistoryTable from "../components/HistoryTable";

const CVHistory = () => {
    // 2. IMPORTANTE: Inicializar navigate
    const navigate = useNavigate();

    // Array vacío para que veas la pantalla de "No hay CVs" (EmptyState)
    const [cvs, setCvs] = useState([]);

    return (
        <div className="p-10 animate-fade-in max-w-7xl mx-auto flex flex-col min-h-screen text-left">

            {/* BOTÓN VOLVER - Ahora sí tiene la función navigate definida */}
            <div className="flex justify-start mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider cursor-pointer">
                    Volver
                </button>
            </div>

            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                    Historial de CVs
                </h1>
            </header>

            <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col">
                {cvs.length > 0 ? (
                    <HistoryTable data={cvs} />
                ) : (
                    <EmptyState />
                )}
            </section>
        </div>
    );
};

export default CVHistory;