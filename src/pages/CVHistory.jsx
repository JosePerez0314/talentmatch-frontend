import React, { useState } from "react";
import EmptyState from "../components/EmptyState";
import HistoryTable from "../components/HistoryTable";

const CVHistory = () => {
    // Array vacío para que veas la pantalla de "No hay CVs" (EmptyState)
    const [cvs, setCvs] = useState([]);

    return (
        <div className="p-10 max-w-6xl mx-auto flex flex-col min-h-screen animate-fade-in text-left">
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