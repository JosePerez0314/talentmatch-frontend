import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Inbox, Briefcase } from "lucide-react";
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal";
import { vacanciesApi } from "../services/api/vacancies.api";
import { MatchResult, Vacancy, ApplicationStatus, Application } from "../types/api.types";

type Notification = {
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "";
};

const Resultados: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [candidates, setCandidates] = useState<MatchResult[]>([]);
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedCandidate, setSelectedCandidate] = useState<MatchResult | null>(null);
    const [updatingCandidateId, setUpdatingCandidateId] = useState<number | null>(null);
    const [notification, setNotification] = useState<Notification>({ show: false, message: "", type: "" });

    const fetchResults = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [results, vac] = await Promise.all([
                vacanciesApi.getResults(id),
                vacanciesApi.getById(id).catch(() => null),
            ]);

            setCandidates(Array.isArray(results) ? results : []);
            setVacancy(vac);
        } catch (error) {
            console.error("Error al obtener candidatos:", error);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [id]);

    const isClosed = vacancy?.status === "CLOSED";
    const availableSlots = vacancy?.availableSlots ?? 0;
    const isSelectionDisabled = isClosed || availableSlots === 0;

    const showNotification = (message: string, type: Notification["type"]) => {
        setNotification({ show: true, message, type });
        window.setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
    };

    const handleStatusChange = async (candidateId: number, newStatus: ApplicationStatus) => {
        if (!id) return;

        try {
            setUpdatingCandidateId(candidateId);

            // Llamada que retorna UpdateCandidateStatusData: { application, vacancy }
            const responseData = await vacanciesApi.updateCandidateStatus(id, candidateId, newStatus);

            // 1. Sincronizar estado y cupos de la vacante de forma segura
            if (responseData?.vacancy) {
                setVacancy((prev) => prev ? {
                    ...prev,
                    status: responseData.vacancy.status,
                    availableSlots: responseData.vacancy.availableSlots,
                } : null);
            }

            // Extracción segura del estado retornado en la aplicación
            const returnedApp = responseData?.application as Application | undefined;
            const updatedAppStatus = returnedApp?.status ?? newStatus;

            // 2. Actualizar las aplicaciones del candidato en la lista local
            setCandidates((prevCandidates) =>
                prevCandidates.map((c) => {
                    const currentCandidateId = c.candidateId ?? c.candidate?.id;
                    if (currentCandidateId === candidateId && c.candidate) {
                        const existingApps = c.candidate.applications ?? [];
                        const updatedApps: Application[] = existingApps.length > 0
                            ? existingApps.map((app) => ({ ...app, status: updatedAppStatus }))
                            : [{ status: updatedAppStatus, vacancyId: Number(id), candidateId }];

                        return {
                            ...c,
                            candidate: {
                                ...c.candidate,
                                applications: updatedApps,
                            },
                        };
                    }
                    return c;
                })
            );

            showNotification("Estado de la postulación actualizado con éxito.", "success");
        } catch (error: unknown) {
            console.error("Error al actualizar el estado del candidato:", error);

            const err = error as { status?: number; response?: { status?: number } };
            const statusCode = err?.status ?? err?.response?.status;

            if (statusCode === 409) {
                showNotification("No quedan cupos disponibles en esta vacante o se encuentra cerrada.", "error");
            } else if (statusCode === 404) {
                showNotification("El registro no fue encontrado. Refrescando el listado...", "error");
                await fetchResults();
            } else if (statusCode === 400) {
                showNotification("Solicitud inválida. Revisa los datos enviados.", "error");
            } else {
                showNotification("Error interno del servidor. Intenta de nuevo más tarde.", "error");
            }
        } finally {
            setUpdatingCandidateId(null);
        }
    };

    const handleViewCandidate = (match: MatchResult) => {
        setSelectedCandidate(match);
        setIsModalOpen(true);
    };

    if (loading) return <ProcessingModal />;

    if (!id) {
        return (
            <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-white p-12 rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 text-center max-w-md">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#447ECA]">
                        <Briefcase className="w-10 h-10 opacity-70" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Selecciona una vacante</h2>
                    <p className="text-gray-400 mt-4 text-sm font-medium leading-relaxed">
                        Para visualizar el análisis de TalentMatch AI, primero debes elegir una vacante activa desde el panel principal.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-8 w-full py-4 bg-[#447ECA] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#3669ab] transition-all transform hover:-translate-y-1"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-6 md:p-12 animate-fade-in">
            {notification.show && (
                <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl z-50 text-white font-medium text-sm flex items-center gap-3 transition-all transform duration-300 ${notification.type === "success"
                        ? "bg-green-600"
                        : notification.type === "error"
                            ? "bg-red-600"
                            : "bg-blue-600"
                    }`}>
                    <span>{notification.message}</span>
                    <button
                        onClick={() => setNotification({ show: false, message: "", type: "" })}
                        className="text-white hover:text-gray-200 text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex flex-col gap-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="self-start flex items-center px-6 py-2.5 bg-[#447ECA] text-white rounded-xl shadow-lg font-bold text-xs hover:bg-[#3669ab] transition-all"
                    >
                        Volver al inicio
                    </button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Resultados: <span className="text-[#447ECA] font-light">Mejores candidatos</span>
                        </h1>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[2px]">
                            Análisis de Vacantes • TalentMatch AI
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                            {vacancy && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${availableSlots > 0
                                        ? "bg-blue-100 text-[#447ECA]"
                                        : "bg-amber-100 text-amber-700"
                                    }`}>
                                    Cupos disponibles: {availableSlots}
                                </span>
                            )}

                            {isSelectionDisabled && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 uppercase tracking-wider">
                                    {isClosed ? "Vacante cerrada" : "Sin cupos disponibles"}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 p-8 pb-12 transition-all">
                    {candidates.length > 0 ? (
                        <div className="w-full flex flex-col gap-2">
                            {candidates.map((c, idx) => {
                                const candidateId = c.candidateId ?? c.candidate?.id;
                                const currentStatus = c.candidate?.applications?.[0]?.status;

                                return (
                                    <div key={c.id ?? idx} className="relative">
                                        <CandidateMatchRow
                                            index={idx}
                                            resultData={c}
                                            onViewClick={() => handleViewCandidate(c)}
                                            onStatusChange={(status) => {
                                                if (candidateId) handleStatusChange(candidateId, status);
                                            }}
                                            isUpdating={updatingCandidateId === candidateId}
                                            disabled={isSelectionDisabled && currentStatus !== "SELECCIONADO"}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-6 text-gray-300">
                                <Inbox className="w-12 h-12" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Sin candidatos analizados</h2>
                            <p className="text-gray-400 text-sm max-w-xs mt-2 font-medium">
                                No se encontraron registros para esta vacante específica.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedCandidate}
            />
        </div>
    );
};

export default Resultados;