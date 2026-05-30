import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyVacancyState from "../components/ui/EmptyVacancyState";
import VacancyActionModal from "../components/modals/VacancyActionModal";

// Assets & Tipos
import { Icons } from "../assets/icons/index";
import { vacanciesApi } from "../services/api/vacancies.api";
import { Vacancy, VacancyStatus } from "../types/vacancy.types";

// Iconos instalados
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlay, FiPause, FiXCircle, FiEye } from "react-icons/fi";

const VacancyHistory: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Control del Menú Kebab
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

    // Control de Modales
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [targetStatus, setTargetStatus] = useState<VacancyStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const fetchVacancies = async () => {
        try {
            setIsLoading(true);
            const response = await vacanciesApi.getAll();
            const rawData = response && 'data' in response ? (response as any).data : response;
            setVacancies(rawData ? [...rawData].reverse() : []);
        } catch (error) {
            console.error("Error fetching vacancies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVacancies();
    }, []);

    const handleViewResults = (id: string | number) => {
        localStorage.setItem("lastVacancyId", String(id));
        navigate(`/resultados/${id}`);
    };

    const toggleMenu = (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    const closeMenu = () => setOpenMenuId(null);

    const handleOpenStatusModal = (vacancy: Vacancy, status: VacancyStatus) => {
        setSelectedVacancy(vacancy);
        setTargetStatus(status);
        setIsModalOpen(true);
        closeMenu();
    };

    const handleConfirmStatusChange = async (id: string | number, status: VacancyStatus) => {
        try {
            const apiStatus = status === 'CONTACTING' ? 'OPEN' : status;
            await vacanciesApi.updateStatus(id, apiStatus);
            setVacancies(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        } catch (error) {
            console.error("Error al actualizar el estado de la vacante:", error);
        }
    };

    const handleDeleteVacancy = (id: string | number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta vacante?")) {
            setVacancies(prev => prev.filter(v => v.id !== id));
            closeMenu();
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const extractPosition = (title: string) => {
        if (!title) return "General";
        return title.replace(/Vacante para/i, "").trim();
    };

    // Estilos de los estados corregidos según las capturas de Figma
    const getStatusStyles = (status: VacancyStatus) => {
        const upperStatus = status ? status.toUpperCase() : "";
        switch (upperStatus) {
            case "OPEN":
            case "ABIERTA":
                return "bg-[#447ECA] text-white"; // El mismo azul del botón
            case "PAUSED":
            case "PAUSADA":
            case "CONTACTING":
            case "CONTACTO":
                return "bg-[#FBC02D] text-[#1E293B]"; // Amarillo Figma con texto legible
            case "CLOSED":
            case "CERRADA":
            case "FILLED":
                return "bg-[#E53935] text-white"; // Rojo sólido de Figma
            default:
                return "bg-gray-500 text-white";
        }
    };

    const getStatusLabel = (status: VacancyStatus) => {
        switch (status) {
            case 'OPEN': return 'Abierta';
            case 'PAUSED': return 'Pausada';
            case 'CLOSED': return 'Cerrada';
            case 'CONTACTING': return 'Contacto';
            default: return status;
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
        <div className="p-10 max-w-6xl mx-auto animate-fade-in relative min-h-screen" onClick={closeMenu}>
            <div className="flex justify-start mb-6">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-[#447ECA] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#3669ab] active:scale-95 transition-all uppercase text-xs tracking-wider">
                    Volver
                </button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Título con Contador de Figma */}
                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-medium text-[#1E293B] mb-1">
                        Historial de Vacantes
                    </h1>
                    <p className="text-sm text-gray-400 font-normal">
                        {vacancies.length} {vacancies.length === 1 ? 'vacante registrada' : 'vacantes registradas'}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F7FF]">
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">TÍTULO</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">POSICIÓN</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">FECHA</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">ESTADO</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569] text-center">VER</th>
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569] text-center">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vacancies.map((vac) => (
                                <tr key={vac.id} className="hover:bg-gray-50 transition-colors relative">
                                    <td className="px-6 py-5 text-sm text-[#64748B] font-medium">Vac-{String(vac.id).padStart(3, '0')}</td>
                                    <td className="px-6 py-5 text-sm font-medium text-[#1E293B]">{vac.title}</td>
                                    <td className="px-6 py-5 text-sm text-[#475569]">
                                        {vac.position?.role || extractPosition(vac.title)}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{formatDate(vac.openDate)}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider ${getStatusStyles(vac.status)}`}>
                                            {getStatusLabel(vac.status)}
                                        </span>
                                    </td>

                                    {/* Botón Completo de Resultados estilo Figma */}
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleViewResults(vac.id)}
                                            className="inline-flex items-center gap-2 bg-[#447ECA] hover:bg-[#356ab0] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                                            title="Ver Resultados IA"
                                            aria-label="Ver Resultados IA"
                                        >
                                            <FiEye className="text-sm" />
                                            Resultados
                                        </button>
                                    </td>

                                    <td className="px-6 py-5 text-center relative">
                                        <button
                                            onClick={(e) => toggleMenu(vac.id, e)}
                                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                            title="Menú de acciones"
                                            aria-label="Menú de acciones"
                                        >
                                            <FiMoreVertical className="text-lg" />
                                        </button>

                                        {openMenuId === vac.id && (
                                            <div
                                                className="absolute right-6 top-14 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-left animate-fade-in"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => { navigate(`/vacancy/edit/${vac.id}`); closeMenu(); }}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <FiEdit2 className="text-blue-500" />
                                                    Editar vacante
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVacancy(vac.id)}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <FiTrash2 />
                                                    Eliminar vacante
                                                </button>

                                                <hr className="my-1 border-gray-100" />

                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'OPEN')}
                                                    disabled={vac.status === 'OPEN'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <FiPlay className="text-emerald-500" />
                                                    Marcar como Activa
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'PAUSED')}
                                                    disabled={vac.status === 'PAUSED' || vac.status === 'CONTACTING'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <FiPause className="text-amber-500" />
                                                    Pausar vacante
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'CLOSED')}
                                                    disabled={vac.status === 'CLOSED'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <FiXCircle className="text-red-500" />
                                                    Cerrar vacante
                                                </button>
                                            </div>
                                        )}
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

            <VacancyActionModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedVacancy(null); setTargetStatus(null); }}
                vacancy={selectedVacancy}
                targetStatus={targetStatus}
                onConfirm={handleConfirmStatusChange}
            />
        </div>
    );
};

export default VacancyHistory;