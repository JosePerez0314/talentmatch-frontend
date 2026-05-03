import React from "react";
import { Icons } from "../../assets/icons";

// 1. ProgressBar con lógica de peso máximo
const ProgressBar = ({ label, current = 0, maxWeight, color }) => {
    // Calculamos el porcentaje real basado en el peso del factor en el motor de JS
    const percentage = maxWeight > 0 ? (current / maxWeight) * 100 : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr_60px] gap-2 sm:gap-6 items-center">
            <span className="text-gray-500 text-[12px] sm:text-[13px] font-medium">{label}</span>
            <div className="flex items-center gap-3 w-full">
                <div className="h-2 sm:h-2.5 w-full bg-gray-300 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: color
                        }}
                    />
                </div>
            </div>
            {/* Muestra la relación real (ej. 18/30) según la documentación */}
            <span className="text-gray-900 font-bold text-[13px] text-right whitespace-nowrap">
                {current}/{maxWeight}
            </span>
        </div>
    );
};

const CandidateDetailsModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const person = data.candidate || {};

    // Colores basados en el overallScore (Sección 5.2 de la documentación)
    const getScoreColor = (score) => {
        if (score >= 80) return "#00FA15"; // Verde (Cumple)
        if (score >= 50) return "#F8C807"; // Amarillo (Parcial)
        return "#EF5050"; // Rojo (Insuficiente)
    };

    const overallScore = data.overallScore || data.matchScore || 0;
    const dynamicColor = getScoreColor(overallScore);
    const blueFilter = { filter: "invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)" };

    const parseArray = (str) => {
        if (Array.isArray(str)) return str;
        if (typeof str === 'string' && str.trim() !== '') return str.split(',').map(s => s.trim());
        return [];
    };

    const techSkills = parseArray(person.skills || person.technicalSkills);
    const languages = parseArray(person.languages);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
            <div className="bg-gray-200 w-full max-w-3xl max-h-[98vh] sm:max-h-[95vh] rounded-[24px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center border-b border-gray-300 bg-gray-200">
                    <button onClick={onClose} className="px-4 sm:px-6 py-2 bg-[#447ECA] text-white text-[12px] sm:text-sm font-bold rounded-full shadow-lg shadow-blue-100 hover:bg-[#3669ab] transition-all">
                        Volver a resultados
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg opacity-40 hover:opacity-100 text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-10 space-y-6 sm:space-y-8">

                    {/* 1. PERFIL CARD */}
                    <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-center sm:items-start border border-gray-300 shadow-sm gap-4 sm:gap-0">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] sm:rounded-[22px] flex flex-col items-center justify-center shadow-lg shrink-0" style={{ backgroundColor: dynamicColor }}>
                                <span className="text-2xl sm:text-3xl font-black leading-none text-white">{Math.round(overallScore)}%</span>
                                <span className="text-white text-[8px] sm:text-[9px] font-black uppercase mt-1">Match</span>
                            </div>
                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                    {person.fullName || "Candidato"}
                                </h2>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-[13px]">
                                    <img src={Icons.auth.mail} className="w-3.5 h-3.5" alt="mail" style={blueFilter} />
                                    <span className="truncate">{person.email || "Sin correo"}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-[13px]">
                                    <img src={Icons.sidebar.vacant} className="w-3.5 h-3.5" alt="rol" style={blueFilter} />
                                    <span>{person.role || "Candidato"} • {person.yearsExperience || 0} años exp.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. DESGLOSE DEL SCORE - Basado en la captura de pesos del Matching Engine */}
                    <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-10 border border-gray-300 shadow-sm space-y-8 sm:space-y-12">
                        <section className="px-0 sm:px-2">
                            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                <img src={Icons.sidebar.history} className="w-4 h-4" alt="score" style={blueFilter} />
                                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[2px]">Desglose de Factores</h3>
                            </div>
                            <div className="space-y-5 sm:space-y-4">
                                {/* Valores de maxWeight extraídos de la captura WhatsApp */}
                                <ProgressBar label="Hard Skills" current={data.hardSkillsScore} maxWeight={30} color={getScoreColor(overallScore)} />
                                <ProgressBar label="Experiencia" current={data.experienceScore} maxWeight={20} color={getScoreColor(overallScore)} />
                                <ProgressBar label="Role" current={data.roleScore} maxWeight={15} color={getScoreColor(overallScore)} />
                                <ProgressBar label="Idiomas" current={data.languagesScore} maxWeight={15} color={getScoreColor(overallScore)} />
                                <ProgressBar label="Educación" current={data.educationScore} maxWeight={10} color={getScoreColor(overallScore)} />
                                <ProgressBar label="Soft Skills" current={data.softSkillsScore} maxWeight={10} color={getScoreColor(overallScore)} />
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={Icons.stats.posCreatedBlue} className="w-4 h-4" alt="tech" style={blueFilter} />
                                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[2px]">Habilidades Técnicas</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {techSkills.length > 0 ? techSkills.map((skill, i) => (
                                    <span key={i} className="px-4 sm:px-5 py-2 bg-[#96FFC1] text-gray-900 text-[12px] sm:text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                )) : <span className="text-sm text-gray-400 italic">No especificadas</span>}
                            </div>
                        </section>
                    </div>

                    {/* 3. JUSTIFICACIÓN DE IA (matchReasoning en la documentación) */}
                    <section className="bg-gray-100 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 border border-gray-300">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={Icons.vacancies.analizCandidates} className="w-6 h-6" alt="ai-analysis" style={blueFilter} />
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[2px]">Análisis Detallado</h3>
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-900 font-medium text-[14px] sm:text-[15px] leading-relaxed italic border-l-4 border-[#447ECA] pl-4">
                                "{data.matchReasoning || data.summary || "Análisis en proceso..."}"
                            </p>
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="p-5 sm:p-8 border-t border-gray-300 bg-gray-200">
                    <a
                        href={person.document?.cloudinaryUrl || person.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full sm:w-auto flex justify-center px-10 py-4 bg-[#447ECA] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-[#3669ab] transition-all ${(!person.document?.cloudinaryUrl && !person.fileUrl) ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        Descargar CV completo
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsModal;