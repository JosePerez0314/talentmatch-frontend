import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../assets/icons";
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow.jsx";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";

// 1. Cambiamos el import al servicio de vacantes
import { vacanciesApi } from "../services/api/vacancies.api";

const Resultados = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);

                // 2. Usamos el método getAll de vacanciesApi
                const response = await vacanciesApi.getAll();

                // Nota: Si el backend devuelve los candidatos dentro de la vacante, 
                // asegúrate de mapear la respuesta correctamente (ej: response.candidates)
                setCandidates(response || []);

            } catch (error) {
                console.error("Error conectando con la API de vacantes:", error);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    if (loading) return <ProcessingModal />;

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-6 md:p-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex flex-col gap-6">
                    <button
                        onClick={() => navigate(-1)}
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
                    {candidates.length > 0 ? (
                        <div className="w-full flex flex-col gap-2">
                            {candidates.map((c, idx) => (
                                <div key={c.id || idx} className="relative">
                                    <CandidateMatchRow
                                        index={idx}
                                        candidate={c}
                                        onStatusChange={(id, status) => {
                                            setCandidates(prev => prev.map(cand => cand.id === id ? { ...cand, status } : cand));
                                        }}
                                        onViewClick={() => handleViewCandidate(c)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-6">
                                <img src={Icons.sidebar.history} alt="No data" className="w-12 h-12 opacity-20" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Sin resultados disponibles</h2>
                            <p className="text-gray-400 text-sm max-w-xs mt-2 font-medium">
                                No se encontraron datos en el módulo de vacantes. Por favor, verifica la configuración del backend.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
            />
        </div>
    );
};

export default Resultados;