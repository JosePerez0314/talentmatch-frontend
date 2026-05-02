import React from "react";
import { Icons } from "../../assets/icons";

const ProgressBar = ({ label, current = 0, color }) => (
    <div className="grid grid-cols-[130px_1fr_40px] gap-6 items-center">
        <span className="text-gray-500 text-[13px] font-medium">{label}</span>
        <div className="h-2.5 w-full bg-gray-300 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${current}%`, backgroundColor: color }}
            />
        </div>
        <span className="text-gray-900 font-bold text-[13px] text-right">{current}/100</span>
    </div>
);

const CandidateDetailsModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const person = data.candidate || {};

    const getScoreColor = (score) => {
        if (score >= 80) return "#00FA15";
        if (score >= 50) return "#F8C807";
        return "#FF4D4D";
    };

    const dynamicColor = getScoreColor(data.matchScore);
    const blueFilter = { filter: "invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)" };

    const parseArray = (str) => {
        if (Array.isArray(str)) return str;
        if (typeof str === 'string' && str.trim() !== '') return str.split(',').map(s => s.trim());
        return [];
    };

    const techSkills = parseArray(person.technicalSkills);
    const optTechSkills = parseArray(person.optionalTechnicalSkills);
    const softSkills = parseArray(person.softSkills);
    const languages = parseArray(person.languages);
    const projectHighlights = person.rawApiPayload?.aiAnalysis?.projectHighlights || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-200 w-full max-w-3xl max-h-[95vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-gray-300 bg-gray-200">
                    <button onClick={onClose} className="px-6 py-2.5 bg-[#447ECA] text-white text-sm font-bold rounded-full shadow-lg shadow-blue-100 hover:bg-[#3669ab] transition-all">
                        Volver a resultados
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg opacity-40 hover:opacity-100">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">

                    {/* 1. PERFIL CARD */}
                    <div className="bg-white rounded-[24px] p-8 flex justify-between items-start border border-gray-300 shadow-sm">
                        <div className="flex gap-6">
                            <div className="w-20 h-20 rounded-[22px] flex flex-col items-center justify-center shadow-lg transition-colors" style={{ backgroundColor: dynamicColor }}>
                                <span className="text-white text-3xl font-black leading-none">{data.matchScore || 0}%</span>
                                <span className="text-white text-[9px] font-black uppercase mt-1">Match</span>
                            </div>
                            <div className="flex flex-col gap-1.5 pt-1">
                                <h2 className="text-2xl font-bold text-gray-900">{person.fullName || "Candidato Desconocido"}</h2>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <img src={Icons.auth.mail} className="w-4 h-4" alt="mail" style={blueFilter} />
                                    <span>{person.email || "Sin correo"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <img src={Icons.sidebar.vacant} className="w-4 h-4" alt="rol" style={blueFilter} />
                                    <span>{person.role || "Candidato"} • {person.yearsOfExperience || 0} años exp.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. DETALLES TÉCNICOS & HABILIDADES */}
                    <div className="bg-white rounded-[24px] p-10 border border-gray-300 shadow-sm space-y-12">
                        <section className="px-2">
                            <div className="flex items-center gap-3 mb-8">
                                <img src={Icons.sidebar.history} className="w-4 h-4" alt="score" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Desglose del score</h3>
                            </div>
                            <div className="space-y-4">
                                <ProgressBar label="Hard Skills" current={data.hardSkillsScore} color={getScoreColor(data.hardSkillsScore)} />
                                <ProgressBar label="Experiencia" current={data.experienceScore} color={getScoreColor(data.experienceScore)} />
                                <ProgressBar label="Rol" current={data.roleScore} color={getScoreColor(data.roleScore)} />
                                <ProgressBar label="Idiomas" current={data.languagesScore} color={getScoreColor(data.languagesScore)} />
                                <ProgressBar label="Educación" current={data.educationScore} color={getScoreColor(data.educationScore)} />
                                <ProgressBar label="Soft Skills" current={data.softSkillsScore} color={getScoreColor(data.softSkillsScore)} />
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={Icons.stats.posCreatedBlue} className="w-4 h-4" alt="tech" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Habilidades técnicas</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {techSkills.length > 0 ? techSkills.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-[#96FFC1] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                )) : <span className="text-sm text-gray-400 italic">No especificadas</span>}
                            </div>
                        </section>

                        <section>
                            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px] mb-5 pl-1">Habilidades técnicas opcionales</h4>
                            <div className="flex flex-wrap gap-3">
                                {optTechSkills.length > 0 ? optTechSkills.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-[#96FFC1] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                )) : <span className="text-sm text-gray-400 italic">No especificadas</span>}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={Icons.stats.checkBlue} className="w-4 h-4" alt="soft" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Habilidades blandas</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {softSkills.length > 0 ? softSkills.map((skill, i) => (
                                    <span key={i} className="px-5 py-2.5 bg-[#DCF9FF] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                )) : <span className="text-sm text-gray-400 italic">No especificadas</span>}
                            </div>
                        </section>
                    </div>

                    {/* 3. EDUCACIÓN E IDIOMAS */}
                    <section className="bg-white rounded-[24px] p-10 border border-gray-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <img src={Icons.sidebar.trophy} className="w-4 h-4" alt="edu" style={blueFilter} />
                                <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px]">Educación</h3>
                            </div>
                            <p className="text-gray-900 font-bold text-sm pl-8">{person.education || "Formación no especificada"}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <img src={Icons.stats.vacantActiveBlue} className="w-4 h-4" alt="lang" style={blueFilter} />
                                <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px]">Idiomas</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-8">
                                {languages.length > 0 ? languages.map((lang, i) => (
                                    <span key={i} className="px-4 py-1.5 bg-[#DCF9FF] rounded-lg text-[12px] font-bold text-gray-900 border border-black/5">{lang}</span>
                                )) : <span className="text-sm text-gray-400 italic">No especificados</span>}
                            </div>
                        </div>
                    </section>

                    {/* 4. ANÁLISIS DE IA Y PROYECTOS */}
                    <section className="bg-gray-100 rounded-[32px] p-8 border border-gray-300">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={Icons.vacancies.analizCandidates} className="w-6 h-6" alt="ai-analysis" style={blueFilter} />
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Análisis Cualitativo de IA</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-gray-400 text-[11px] font-bold uppercase mb-2 pl-1">Resumen Ejecutivo</h4>
                                <p className="text-gray-900 font-bold text-[15px] leading-relaxed italic border-l-4 border-[#447ECA] pl-4">
                                    "{data.summary || "La IA no proporcionó un resumen para este candidato."}"
                                </p>
                            </div>
                            <div>
                                <h4 className="text-gray-400 text-[11px] font-bold uppercase mb-3 pl-1">Proyectos destacados</h4>
                                <ul className="space-y-3">
                                    {projectHighlights.length > 0 ? projectHighlights.map((proj, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700 font-bold text-sm">
                                            <div className="w-1.5 h-1.5 bg-[#447ECA] rounded-full shrink-0 mt-1.5" />
                                            <span>{proj}</span>
                                        </li>
                                    )) : <li className="text-sm text-gray-400 italic pl-4">No se encontraron proyectos destacados</li>}
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <div className="p-8 border-t border-gray-300 flex justify-end items-center gap-6 bg-gray-200">
                    <a
                        href={person.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-10 py-4 bg-[#447ECA] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#3669ab] transition-all ${!person.fileUrl ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        Descargar CV completo
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsModal;