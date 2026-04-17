import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components (ajustados a la nueva ruta desde pages)
import EmptyVacancyState from "../components/ui/EmptyVacancyState";

// Assets (ajustados a la nueva ruta desde pages)
import { Icons } from "../assets/icons/index";

const VacancyHistory = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState([]);

    // Leer los datos del localStorage al cargar
    useEffect(() => {
        const savedVacancies = JSON.parse(localStorage.getItem("talenmatch_vacancies") || "[]");
        // .reverse() para que las más nuevas salgan arriba
        setVacancies([...savedVacancies].reverse());
    }, []);

    // Estilos de los estados (Fiel a la imagen)
    const getStatusStyles = (status) => {
        switch (status) {
            case "Abierta":
                return "bg-[#E0F2FE] text-[#0369A1]"; // Azul
            case "Contacto":
                return "bg-[#FEF9C3] text-[#854D0E]"; // Amarillo
            case "Cerrada":
                return "bg-[#FEE2E2] text-[#991B1B]"; // Rojo
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    if (vacancies.length === 0) {
        return (
            <div className="p-10">
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider"
                    >
                        Volver
                    </button>
                </div>
                <EmptyVacancyState onCreateClick={() => navigate("/vacancy")} />
            </div>
        );
    }

    return (
        <div className="p-10 max-w-6xl mx-auto animate-fade-in relative min-h-screen">

            {/* Botón Volver */}
            <div className="flex justify-start mb-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider"
                >
                    Volver
                </button>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <h1 className="text-2xl font-medium text-[#1E293B] p-8 pb-4">
                    Historial de Vacantes
                </h1>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F7FF]">
                                <th className="px-8 py-4 text-sm font-semibold text-[#475569]">Posición</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">ID Vacante</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Fecha de Inicio</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Fecha de Cierre</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Estado</th>
                                <th className="px-8 py-4 text-sm font-semibold text-[#475569] text-center">Resultados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vacancies.map((vac, index) => (
                                <tr key={vac.id || index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-medium text-[#1E293B]">{vac.position}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{vac.id}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{vac.startDate}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{vac.endDate}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(vac.status)}`}>
                                            {vac.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <img
                                                src={Icons.vacancies.eyeIcon || Icons.vacancies.analizCandidates}
                                                alt="Ver"
                                                className="w-5 h-5 opacity-50"
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Botón Nueva Vacante */}
            <div className="flex justify-end mt-8 pb-10">
                <button
                    onClick={() => navigate("/vacancy")}
                    className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#356BB0] transition-all active:scale-95"
                >
                    <span className="text-xl leading-none">+</span>
                    Nueva Vacante
                </button>
            </div>
        </div>
    );
};

export default VacancyHistory;