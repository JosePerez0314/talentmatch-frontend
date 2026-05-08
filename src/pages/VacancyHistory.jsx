import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyVacancyState from "../components/ui/EmptyVacancyState";

// Assets
import { Icons } from "../assets/icons/index";
import { vacanciesApi } from "../services/api/vacancies.api";

const VacancyHistory = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVacancies = async () => {
            try {
                const data = await vacanciesApi.getAll();
                // If there is data, we invert it to show the most recent first
                setVacancies(data ? [...data].reverse() : []);
            } catch (error) {
                console.error("Error fetching vacancies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVacancies();
    }, []);

    // FUNCIÓN ACTUALIZADA: Guarda el ID antes de navegar
    const handleViewResults = (id) => {
        localStorage.setItem("lastVacancyId", id);
        navigate(`/resultados/${id}`);
    };

    // Helper to format API dates into a readable format
    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const getStatusStyles = (status) => {
        const upperStatus = status ? status.toUpperCase() : "";
        switch (upperStatus) {
            case "OPEN": // Adapted to the actual status of the backend
            case "ABIERTA":
                return "bg-[#E0F2FE] text-[#0369A1]"; // Azul
            case "CONTACTING":
            case "CONTACTO":
                return "bg-[#FEF9C3] text-[#854D0E]"; // Amarillo
            case "FILLED":
            case "CERRADA":
                return "bg-[#FEE2E2] text-[#991B1B]"; // Rojo
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-4">
                <img src={Icons.auth.loading} alt="Cargando" className="w-12 h-12 animate-spin opacity-50" />
                <p className="text-gray-500 font-medium tracking-wide">Cargando vacantes...</p>
            </div>
        );
    }

    if (vacancies.length === 0) {
        return (
            <div className="p-10">
                <div className="flex justify-start mb-6">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider">
                        Volver
                    </button>
                </div>
                <EmptyVacancyState onCreateClick={() => navigate("/vacancy")} />
            </div>
        );
    }

    return (
        <div className="p-10 max-w-6xl mx-auto animate-fade-in relative min-h-screen">
            <div className="flex justify-start mb-6">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider">
                    Volver
                </button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <h1 className="text-2xl font-medium text-[#1E293B] p-8 pb-4">
                    Historial de Vacantes
                </h1>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F7FF]">
                                <th className="px-8 py-4 text-sm font-semibold text-[#475569]">Título / Posición</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">ID Vacante</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Fecha de Inicio</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Fecha de Cierre</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">Estado</th>
                                <th className="px-8 py-4 text-sm font-semibold text-[#475569] text-center">Resultados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vacancies.map((vac) => (
                                <tr key={vac.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-medium text-[#1E293B]">{vac.title}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">VAC-{vac.id}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{formatDate(vac.openDate)}</td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{formatDate(vac.closeDate)}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(vac.status)}`}>
                                            {vac.status === 'OPEN' ? 'ABIERTA' : vac.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button
                                            onClick={() => handleViewResults(vac.id)}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-all group"
                                            title="Ver Resultados IA"
                                        >
                                            <img
                                                src={Icons.vacancies.eyeIcon || Icons.stats.eyeHistoryGray}
                                                alt="Ver Resultados"
                                                className="w-5 h-5 transition-all"
                                                style={{
                                                    filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)"
                                                }}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end mt-8 pb-10">
                <button onClick={() => navigate("/vacancy")} className="flex items-center gap-2 bg-[#447ECA] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#356BB0] transition-all active:scale-95">
                    <span className="text-xl leading-none">+</span>
                    Nueva Vacante
                </button>
            </div>
        </div>
    );
};

export default VacancyHistory;