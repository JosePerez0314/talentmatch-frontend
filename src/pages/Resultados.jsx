import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icons } from "../assets/icons";
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow.jsx";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";
import { vacanciesApi } from "../services/api/vacancies.api";

const Resultados = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Este es el vacancyId
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
        const fetchResults = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await vacanciesApi.getResults(id);

                let candidatesData = [];
                if (response && response.status === "success") {
                    candidatesData = response.data.results || response.data;
                } else if (Array.isArray(response)) {
                    candidatesData = response;
                } else if (response?.candidates) {
                    candidatesData = response.candidates;
                }

                setCandidates(candidatesData);
            } catch (error) {
                console.error("Error al obtener candidatos:", error);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    // NUEVA FUNCIÓN: Maneja el cambio de estado y cierra la vacante según lo dicho por José
    const handleStatusChange = async (matchId, newStatus) => {
        try {
            // 1. Feedback visual inmediato
            setCandidates(prev => prev.map(c =>
                (c.id === matchId)
                    ? { ...c, candidate: { ...c.candidate, status: newStatus } }
                    : c
            ));

            if (newStatus === "Contratado") {
                console.log("Cerrando vacante...");
                await vacanciesApi.updateStatus(id, "FILLED");
                // Mostrar alerta nativa estándar mientras integramos el componente visual
                alert("¡Candidato contratado y vacante cerrada con éxito!");
            } else {
                alert(`Estado actualizado a: ${newStatus}`);
            }

        } catch (error) {
            console.error("Error al actualizar estados:", error);
            alert("No se pudo guardar el cambio en el servidor.");
        }
    };

    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    if (loading) return <ProcessingModal />;

    if (!id) {
        return (
            <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-6 animate-fade-in">
                {/* NUEVO: Contenedor flotante de la notificación */}
                {notification.show && (
                    <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl z-50 text-white font-medium text-sm flex items-center gap-3 transition-all transform duration-300 ${notification.type === 'success' ? 'bg-green-600' :
                        notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
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
                <div className="bg-white p-12 rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 text-center max-w-md">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={Icons.sidebar.historyVacant} className="w-10 h-10 opacity-40" alt="vacantes" />
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
                    </div>
                </header>

                <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 p-8 pb-12 transition-all">
                    {candidates && candidates.length > 0 ? (
                        <div className="w-full flex flex-col gap-2">
                            {candidates.map((c, idx) => (
                                <div key={c.id || idx} className="relative">
                                    <CandidateMatchRow
                                        index={idx}
                                        resultData={c}
                                        onViewClick={() => handleViewCandidate(c)}
                                        onStatusChange={handleStatusChange} // PASAMOS LA FUNCIÓN AQUÍ
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-6">
                                <img src={Icons.sidebar.history} alt="No data" className="w-12 h-12 opacity-20" />
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