import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import VacancyActionModal from "../components/modals/VacancyActionModal";

import { vacanciesApi } from "../services/api/vacancies.api";
import { Vacancy, VacancyStatus } from "../types/api.types";

import { MoreVertical, Edit2, Trash2, Play, Pause, XCircle, Eye, Plus, Loader2, ClipboardList } from "lucide-react";

const getStatusStyle = (status: VacancyStatus): React.CSSProperties => {
    if (status === "ACTIVE") return { backgroundColor: '#447ECA', color: 'white' };
    if (status === "PAUSED") return { backgroundColor: '#F8C807', color: '#1E293B' };
    return { backgroundColor: '#EF5050', color: 'white' };
};

const getStatusLabel = (status: VacancyStatus): string => {
    if (status === "ACTIVE") return "Activa";
    if (status === "PAUSED") return "Pausada";
    return "Cerrada";
};

const formatDate = (iso: string): string => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const VacancyHistory: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [loadingResultId, setLoadingResultId] = useState<number | null>(null);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [targetStatus, setTargetStatus] = useState<VacancyStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const fetchVacancies = async () => {
        try {
            setIsLoading(true);
            const data = await vacanciesApi.getAll();
            setVacancies([...data].reverse());
        } catch (error) {
            console.error("Error fetching vacancies:", error);
            setErrorMessage("No se pudieron cargar las vacantes.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVacancies(); }, []);

    const handleViewResults = (id: number) => {
        setLoadingResultId(id);
        localStorage.setItem("lastVacancyId", String(id));
        navigate(`/advanced-results/${id}`);
    };

    const toggleMenu = (id: number, e: React.MouseEvent) => {
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

    const handleConfirmStatusChange = async (id: number, status: VacancyStatus) => {
        try {
            setErrorMessage(null);
            await vacanciesApi.updateStatus(id, status);
            setVacancies(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            setErrorMessage("No se pudo actualizar el estado de la vacante.");
        }
    };

    const handleDeleteVacancy = async (id: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta vacante de forma permanente?")) {
            try {
                setErrorMessage(null);
                await vacanciesApi.delete(id);
                setVacancies(prev => prev.filter(v => v.id !== id));
                closeMenu();
            } catch (error) {
                console.error("Error al eliminar vacante:", error);
                setErrorMessage("No se pudo eliminar la vacante.");
            }
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto" onClick={closeMenu}>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-gray-800">Historial de Vacantes</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {vacancies.length} vacante{vacancies.length !== 1 ? "s" : ""} registrada{vacancies.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); navigate("/vacancy"); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-xl transition-colors"
                    style={{ backgroundColor: '#447ECA' }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
                >
                    <Plus size={14} /> Nueva Vacante
                </button>
            </div>

            {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium p-4">
                    {errorMessage}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="animate-spin text-[#447ECA]" size={22} />
                    </div>
                ) : vacancies.length === 0 ? (
                    <div className="p-20 flex flex-col items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: '#DCF9FF' }}
                        >
                            <ClipboardList size={24} style={{ color: '#447ECA' }} />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm mb-1">No hay vacantes creadas</p>
                            <p className="text-gray-400 text-xs">Crea tu primera vacante para comenzar a evaluar candidatos.</p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); navigate("/vacancy"); }}
                            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm transition-colors"
                            style={{ backgroundColor: '#447ECA' }}
                            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
                            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
                        >
                            <Plus size={14} /> Crear Vacante
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-5 py-3 text-xs text-gray-400 uppercase tracking-wider text-left">ID</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-left">Título</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-left hidden sm:table-cell">Posición</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-left">Fecha</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-left">Estado</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-center">Ver</th>
                                    <th className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {vacancies.map((vac, index) => {
                                    const isNearBottom = index >= vacancies.length - 3 && vacancies.length > 2;

                                    return (
                                        <tr key={vac.id} className="hover:bg-gray-50 transition-colors relative">
                                            <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">
                                                Vac-{String(vac.id).padStart(3, "0")}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-700">{vac.title}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-400 hidden sm:table-cell">
                                                {vac.position?.role ?? "—"}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                                                {formatDate(vac.startDate)}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap font-medium"
                                                    style={getStatusStyle(vac.status)}
                                                >
                                                    {getStatusLabel(vac.status)}
                                                </span>
                                            </td>

                                            {/* Results button */}
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    onClick={() => handleViewResults(vac.id)}
                                                    disabled={loadingResultId === vac.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-colors disabled:opacity-75"
                                                    style={{ backgroundColor: '#447ECA' }}
                                                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3a6bb8')}
                                                    onMouseOut={e => (e.currentTarget.style.backgroundColor = '#447ECA')}
                                                    title="Ver Resultados IA"
                                                >
                                                    {loadingResultId === vac.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <Eye size={12} />
                                                    )}
                                                    Resultados
                                                </button>
                                            </td>

                                            {/* Kebab menu */}
                                            <td className="px-4 py-3.5 text-right relative">
                                                <button
                                                    title="Opciones de vacante"
                                                    onClick={(e) => toggleMenu(vac.id, e)}
                                                    className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all text-gray-400"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {openMenuId === vac.id && (
                                                    <div
                                                        className={`absolute right-4 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-left ${isNearBottom ? "bottom-full mb-1" : "top-12"
                                                            }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => { navigate(`/vacancy/edit/${vac.id}`); closeMenu(); }}
                                                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Edit2 size={15} className="text-blue-500" /> Editar vacante
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVacancy(vac.id)}
                                                            className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Trash2 size={15} /> Eliminar vacante
                                                        </button>
                                                        <hr className="my-1 border-gray-100" />
                                                        <button
                                                            onClick={() => handleOpenStatusModal(vac, 'ACTIVE')}
                                                            disabled={vac.status === 'ACTIVE'}
                                                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <Play size={15} className="text-emerald-500 fill-current" /> Marcar como Activa
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenStatusModal(vac, 'PAUSED')}
                                                            disabled={vac.status === 'PAUSED'}
                                                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <Pause size={15} className="text-amber-500 fill-current" /> Pausar vacante
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenStatusModal(vac, 'CLOSED')}
                                                            disabled={vac.status === 'CLOSED'}
                                                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                        >
                                                            <XCircle size={15} className="text-red-500" /> Cerrar vacante
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
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