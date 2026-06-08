import React, { useState, useEffect, useRef } from "react";
import { useNavigate,  } from "react-router-dom";
import { ArrowLeft, Share2, Sparkles, Layers, Calendar, ChevronDown, Eye } from "lucide-react";

// --- se quito useParams y const { id } = useParams(); porque por ahora no se conecta a API, pero se deja comentado para futura integración ---

// TIPADOS
type CandidateStatus = "No Contratado" | "Contactado" | "Contratado";

interface MockCandidate {
    id: string;
    fullName: string;
    email: string;
    matchScore: number;
    role: string;
    status: CandidateStatus;
    rank: number;
}

//   MOCK DATA ESTÁTICO (para validación visual)
const MOCK_RESULTS: MockCandidate[] = [
    { id: "1", rank: 1, fullName: "María López", email: "maria.lopez@gmail.com", matchScore: 94, role: "UX/UI Designer", status: "No Contratado" },
    { id: "2", rank: 2, fullName: "Ana García", email: "ana.garcia@gmail.com", matchScore: 69, role: "Frontend Developer", status: "Contactado" },
    { id: "3", rank: 3, fullName: "Diego Vargas", email: "diego.vargas@gmail.com", matchScore: 63, role: "Product Manager", status: "Contratado" },
];

// COMPONENTES DE UI

// Gráfico Circular SVG Nativo 
const CircularProgress = ({ score }: { score: number }) => {
    const radius = 54;
    const stroke = 7;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "#00FA15"; // Verde
        if (s >= 50) return "#F8C807"; // Amarillo
        return "#EF5050";              // Rojo
    };


    return (
        <div className="relative flex items-center justify-center w-[100px] h-[100px]">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle stroke="#F3F4F6" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle 
                    stroke={getColor(score)} 
                    fill="transparent" 
                    strokeWidth={stroke} 
                    strokeDasharray={circumference + ' ' + circumference} 
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-in-out' }} 
                    strokeLinecap="round" 
                    r={normalizedRadius} 
                    cx={radius} 
                    cy={radius} 
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800 leading-none">{score}%</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">Match</span>
            </div>
        </div>
    );
};

//  Dropdown Custom para Estados de Contratación
const StatusDropdown = ({ status, onChange }: { status: CandidateStatus, onChange: (s: CandidateStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cierra el dropdown si hacen click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getStyles = (s: CandidateStatus) => {
        switch (s) {
            case "Contratado": return "border-[#4ADE80] text-[#16A34A] bg-[#F0FDF4]";
            case "Contactado": return "border-[#F8C807] text-[#CA8A04] bg-[#FEFCE8]";
            default: return "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100";
        }
    };

    const options: CandidateStatus[] = ["No Contratado", "Contactado", "Contratado"];

return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-colors ${getStyles(status)}`}
            >
                {status} <ChevronDown size={14} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in">
                    {options.map(opt => (
                        <button
                            key={opt}
                            onClick={(e) => { e.stopPropagation(); onChange(opt); setIsOpen(false); }}
                            className="w-full text-left px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

//  VISTA PRINCIPAL DE RESULTADOS AVANZADOS 
const AdvancedResults: React.FC = () => {
    const navigate = useNavigate();
    
    // Estados
    const [candidates, setCandidates] = useState<MockCandidate[]>(MOCK_RESULTS);

    // Funciones
    const handleStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
        // Actualización optimista del UI
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
    };

    const handleViewCandidateProfile = (candidate: MockCandidate) => {
        // Aquí se conectará  CandidateDetailsModal
        
        console.log("Abriendo perfil avanzado para:", candidate.fullName);
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10 animate-fade-in flex justify-center">
            <div className="w-full max-w-[1400px]">
                
                {/*  TOP HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    {/* Botón Volver */}
                    <button
                        onClick={() => navigate(-1)} // Vuelve al componente anterior Resultados.tsx
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                        <ArrowLeft size={18} /> Volver al historial
                    </button>

                    {/*  Titulo Central */}
                    <div className="text-center flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-medium text-gray-900">Diseñador UX/UI Senior</h1>
                            <span className="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-[11px] font-bold rounded-full">Activa</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-1.5 flex items-center gap-2 justify-center">
                            Vac-001 <Layers size={12} className="opacity-50" /> Tecnología / IT
                        </p>
                    </div>

                    {/* Acciones de la Vacante   */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm">
                            <Share2 size={16} className="opacity-70" /> Compartir
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#447ECA] text-white rounded-xl font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all text-sm">
                            <Sparkles size={16} /> Recalcular MatchScore
                        </button>
                    </div>
                </header>

                {/*   ALERT BANNER */}
                <div className="bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-4 flex items-center gap-3 mb-6">
                    <Sparkles className="text-[#447ECA]" size={20} strokeWidth={2.5} />
                    <p className="text-sm text-[#447ECA] font-medium">
                        Mostrando el <strong>Top 10</strong> de candidatos con mayor compatibilidad con los requisitos de la posición.
                    </p>
                </div>

                {/*  RESUMEN DE MAETRICAS */}
                <p className="text-gray-500 font-medium text-sm mb-6">
                    <span className="text-[#447ECA] font-bold">{candidates.length} candidatos</span> evaluados · {candidates.length} CVs para esta vacante
                </p>

                {/*   GRID DE TARJETAS DE RESULTADOS  */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((c) => (
                        <div key={c.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col relative group hover:shadow-md transition-shadow">
                            
                            {/* Rango Top  */}
                            <div className="absolute top-6 right-6 text-gray-300 font-bold text-sm">
                                #{c.rank}
                            </div>

                            {/* Info de Candidato   */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-[#DCF9FF] text-[#447ECA] font-bold flex items-center justify-center text-sm shrink-0">
                                    {c.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                </div>
                                <div className="flex flex-col truncate pr-8">
                                    <h3 className="text-base font-medium text-gray-900 truncate">{c.fullName}</h3>
                                    <p className="text-[13px] text-gray-400 truncate">{c.email}</p>
                                </div>
                            </div>

                            {/*  Donut Chart Nativo */}
                            <div className="flex justify-center mb-8">
                                <CircularProgress score={c.matchScore} />
                            </div>

                            {/* Detalles de la Posición y CV */}
                            <div className="flex flex-col gap-3 mb-8">
                                <span className="inline-flex w-fit px-3 py-1 bg-[#EAF7FF] text-[#447ECA] rounded-full text-[11px] font-bold">
                                    {c.role}
                                </span>
                                <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                                    <Calendar size={14} /> CV subido para esta vacante
                                </div>
                            </div>

                            {/*   Footer de Acciones  */}
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                <StatusDropdown status={c.status} onChange={(s) => handleStatusChange(c.id, s)} />
                                
                                <button 
                                    onClick={() => handleViewCandidateProfile(c)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#447ECA] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all"
                                >
                                    <Eye size={16} /> Ver perfil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedResults;