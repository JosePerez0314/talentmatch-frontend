import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 

//Components
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow.jsx";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";

// Assets and Services
import { vacanciesApi } from "../services/api/vacancies.api.js";
import { candidateService } from "../services/api/candidates.api.js";
import { Icons } from "../assets/icons";

const Resultados = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResultsAndEnrich = async () => {
            setLoading(true);
            try {
                const [resultsData, allCandidates] = await Promise.all([
                    vacanciesApi.getResults(id),
                    candidateService.getAll()
                ]);

                const safeResults = resultsData || [];
                const safeCandidates = allCandidates || [];

                // Cross-referenced the AI ​​results with the candidate's complete profile.
                const enrichedResults = safeResults.map(result => {
                    // Search for the complete candidate using the ID that comes in the result.
                    const fullCandidateProfile = safeCandidates.find(c => c.id === result.candidate?.id);
                    
                    return {
                        ...result,
                        // Merge basic data with skills, education, and projects
                        candidate: {
                            ...result.candidate,
                            ...fullCandidateProfile
                        }
                    };
                });

                setCandidates(enrichedResults);
            } catch (err) {
                console.error("Error al cargar resultados e hidratar datos:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchResultsAndEnrich();
    }, [id]);

    const handleViewCandidate = (candidateData) => {
        setSelectedCandidate(candidateData);
        setIsModalOpen(true);
    };

    if (loading) return <ProcessingModal />;

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-6 md:p-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex flex-col gap-6">
                    <button onClick={() => navigate(-1)} className="self-start flex items-center px-6 py-2.5 bg-[#447ECA] rounded-xl shadow-lg shadow-blue-900/10 text-xs font-bold text-white hover:bg-[#3669ab] transition-all active:scale-95">
                        Volver al inicio
                    </button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Resultados: <span className="text-[#447ECA] font-light">Mejores candidatos</span>
                        </h1>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[2px]">Vacante: Vac-{id}</p>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                        Error conectando con la base de datos: {error}
                    </div>
                )}

                <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 p-8 pb-12 transition-all">
                    <div className="w-full flex flex-col gap-2">
                        {candidates.length > 0 ? candidates.map((result, idx) => (
                            <div key={result.id} className="relative" style={{ zIndex: candidates.length - idx }}>
                                <CandidateMatchRow
                                    index={idx}
                                    resultData={result}
                                    onViewClick={() => handleViewCandidate(result)}
                                />
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-10">No hay candidatos procesados para esta vacante.</p>
                        )}
                    </div>
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