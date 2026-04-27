import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../assets/icons";
import ProcessingModal from "../components/ui/ProcessingModal.jsx";
import CandidateMatchRow from "../components/cards/CandidateMatchRow.jsx";
// 1. IMPORTAR EL MODAL
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";

const Resultados = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);

    // 2. ESTADOS PARA CONTROLAR EL MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCandidates([
                { id: 1, name: "María López", email: "maria.lopez@gmail.com", fileName: "Maria_Lopez.pdf", matchScore: 85, status: "No Contratado" },
                { id: 2, name: "Ana García", email: "ana.garcia@gmail.com", fileName: "Ana_Garcia.pdf", matchScore: 82, status: "No Contratado" },
                { id: 3, name: "Diego Vargas", email: "diego.vargas@gmail.com", fileName: "Diego_Vargas.pdf", matchScore: 78, status: "No Contratado" },
            ]);
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // 3. FUNCIONES DE MANEJO
    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    if (loading) return <ProcessingModal />;

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-6 md:p-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="self-start flex items-center px-4 py-2 bg-[#447ECA] rounded-xl shadow-sm text-xs font-medium text-white hover:bg-[#3669ab] transition-all active:scale-95"
                    >
                        Volver al inicio
                    </button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-[#447ECA]">
                            Resultados: <span className="text-gray-800 font-normal">Mejores candidatos</span>
                        </h1>
                        <p className="text-gray-400 text-xs">Vacante: Desarrollador senior UX & UI  •  Vac-001  •  Documentos activos</p>
                    </div>
                </header>

                <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 pb-40 border border-white">
                    <div className="w-full flex flex-col">
                        {candidates.map((c, idx) => (
                            <div key={c.id} className="relative" style={{ zIndex: candidates.length - idx }}>
                                <CandidateMatchRow
                                    index={idx}
                                    candidate={c}
                                    onStatusChange={(id, status) => {
                                        setCandidates(prev => prev.map(cand => cand.id === id ? { ...cand, status } : cand));
                                    }}
                                    // 4. PASAMOS LA FUNCIÓN AL BOTÓN DEL OJO
                                    onViewClick={() => handleViewCandidate(c)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. EL COMPONENTE MODAL AL FINAL (Fuera del flujo principal) */}
            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
            />
        </div>
    );
};

export default Resultados;