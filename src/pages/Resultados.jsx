import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../assets/icons";
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow.jsx";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";

const Resultados = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCandidates([
                { id: 1, name: "María López", email: "maria.lopez@gmail.com", fileName: "Maria_Lopez.pdf", matchScore: 85, status: "No Contratado" },
                { id: 2, name: "Ana García", email: "ana.garcia@gmail.com", fileName: "Ana_Garcia.pdf", matchScore: 82, status: "No Contratado" },
                { id: 3, name: "Diego Vargas", email: "diego.vargas@gmail.com", fileName: "Diego_Vargas.pdf", matchScore: 78, status: "No Contratado" },
                { id: 4, name: "Carlos Ruiz", email: "carlos.ruiz@gmail.com", fileName: "Carlos_Ruiz_CV.pdf", matchScore: 42, status: "No Contratado" },
            ]);
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
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
                        className="self-start flex items-center px-6 py-2.5 bg-[#447ECA] rounded-xl shadow-lg shadow-blue-900/10 text-xs font-bold text-white hover:bg-[#3669ab] transition-all active:scale-95"
                    >
                        Volver al inicio
                    </button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Resultados: <span className="text-[#447ECA] font-light">Mejores candidatos</span>
                        </h1>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[2px]">Vacante: Desarrollador senior UX & UI  •  Vac-001</p>
                    </div>
                </header>

                {/* CONTENEDOR PRINCIPAL ACTUALIZADO */}
                {/* Añadido border-gray-200/60 y shadow-2xl suave para que "despegue" del fondo */}
                <div className="bg-white rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-200/60 p-8 pb-12 transition-all">
                    <div className="w-full flex flex-col gap-2">
                        {candidates.map((c, idx) => (
                            <div key={c.id} className="relative" style={{ zIndex: candidates.length - idx }}>
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