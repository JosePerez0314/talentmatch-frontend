import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyVacancyState from "../components/ui/EmptyVacancyState"; 
import VacancyActionModal from "../components/modals/VacancyActionModal";

// Assets & Tipos & API
import { Icons } from "../assets/icons/index";
import { vacanciesApi } from "../services/api/vacancies.api";
import { Vacancy, VacancyStatus } from "../types/api.types";

// Iconos unificados con Lucide React
import { MoreVertical, Edit2, Trash2, Play, Pause, XCircle, Eye } from "lucide-react";

const VacancyHistory: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Control del Menú Kebab
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Control de Modales
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [targetStatus, setTargetStatus] = useState<VacancyStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // CONEXIÓN
    const fetchVacancies = async () => {
        try {
            setIsLoading(true);
            const data = await vacanciesApi.getAll();
            // Desempaquetado
            const rawData = Array.isArray(data) ? data : (data as any)?.data || [];
            // para ver la recientes primero
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

    const handleViewResults = (id: number) => {
        localStorage.setItem("lastVacancyId", String(id));
        navigate(`/resultados/${id}`);
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

    // CONEXIÓN PATCH /vacancies/:id/status
    const handleConfirmStatusChange = async (id: number, status: VacancyStatus) => {
        try {
            await vacanciesApi.updateStatus(id, status);
            // Actualizacion
            setVacancies(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        } catch (error) {
            console.error("Error al actualizar el estado de la vacante:", error);
            alert("Ocurrió un error al actualizar el estado.");
        }
    };

    // CONEXIÓN DELETE /vacancies/:id
    const handleDeleteVacancy = async (id: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta vacante de forma permanente?")) {
            try {
                await vacanciesApi.delete(id);
                setVacancies(prev => prev.filter(v => v.id !== id));
                closeMenu();
            } catch (error) {
                console.error("Error al eliminar la vacante:", error);
                alert("Ocurrió un error al intentar eliminar la vacante.");
            }
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

    // Estilos
    const getStatusStyles = (status: VacancyStatus) => {
        switch (status) {
            case "ACTIVE": return "bg-[#447ECA] text-white"; // Azul Figma
            case "PAUSED": return "bg-[#FBC02D] text-[#1E293B]"; // Amarillo Figma
            case "CLOSED": return "bg-[#E53935] text-white"; // Rojo sólido Figma
            default: return "bg-gray-500 text-white";
        }
    };

    const getStatusLabel = (status: VacancyStatus) => {
        switch (status) {
            case 'ACTIVE': return 'Activa';
            case 'PAUSED': return 'Pausada';
            case 'CLOSED': return 'Cerrada';
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
                                <th className="px-6 py-4 text-sm font-semibold text-[#475569]">FECHA INICIO</th>
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
                                    <td className="px-6 py-5 text-sm text-[#64748B]">{formatDate(vac.startDate)}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider ${getStatusStyles(vac.status)}`}>
                                            {getStatusLabel(vac.status)}
                                        </span>
                                    </td>

                                    {/* Botón de Resultados */}
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleViewResults(vac.id)}
                                            className="inline-flex items-center gap-2 bg-[#447ECA] hover:bg-[#356ab0] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                                            title="Ver Resultados IA"
                                        >
                                            <Eye size={16} /> Resultados
                                        </button>
                                    </td>

                                    {/* Kebab Menu de Acciones */}
                                    <td className="px-6 py-5 text-center relative">
                                        <button
                                            onClick={(e) => toggleMenu(vac.id, e)}
                                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreVertical size={18} />
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
                                                    <Edit2 size={16} className="text-blue-500" /> Editar vacante
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleDeleteVacancy(vac.id)}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <Trash2 size={16} /> Eliminar vacante
                                                </button>

                                                <hr className="my-1 border-gray-100" />

                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'ACTIVE')}
                                                    disabled={vac.status === 'ACTIVE'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <Play size={16} className="text-emerald-500 fill-current" /> Marcar como Activa
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'PAUSED')}
                                                    disabled={vac.status === 'PAUSED'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <Pause size={16} className="text-amber-500 fill-current" /> Pausar vacante
                                                </button>
                                                <button
                                                    onClick={() => handleOpenStatusModal(vac, 'CLOSED')}
                                                    disabled={vac.status === 'CLOSED'}
                                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                                >
                                                    <XCircle size={16} className="text-red-500" /> Cerrar vacante
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
                    <span className="text-xl leading-none">+</span> Nueva Vacante
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