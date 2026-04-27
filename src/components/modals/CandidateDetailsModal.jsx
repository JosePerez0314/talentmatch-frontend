import React from "react";
import { Icons } from "../../assets/icons";

const CandidateDetailsModal = ({ isOpen, onClose, candidate }) => {
    if (!isOpen || !candidate) return null;

    // Colores originales del score
    const getScoreColor = (score) => {
        if (score >= 80) return "#00FA15";
        if (score >= 50) return "#F8C807";
        return "#FF4D4D";
    };

    const dynamicColor = getScoreColor(candidate.matchScore);

    // Tu filtro original para iconos en azul corporativo #447ECA
    const blueFilter = {
        filter: "invert(46%) sepia(48%) saturate(545%) hue-rotate(174deg) brightness(92%) contrast(90%)"
    };

    const ProgressBar = ({ label, current, max, color }) => (
        <div className="grid grid-cols-[130px_1fr_40px] gap-6 items-center">
            <span className="text-gray-500 text-[13px] font-medium">{label}</span>
            <div className="h-2.5 w-full bg-gray-300 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(current / max) * 100}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-gray-900 font-bold text-[13px] text-right">{current}/{max}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            {/* Contenedor principal con el Gris 200 solicitado */}
            <div className="bg-gray-200 w-full max-w-3xl max-h-[95vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">

                {/* Header / Nav - Sincronizado con Gris 200 */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-gray-300 bg-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#447ECA] text-white text-sm font-bold rounded-full shadow-lg shadow-blue-100 hover:bg-[#3669ab] transition-all active:scale-95 flex items-center gap-2">
                        <span>Volver a resultados</span>
                    </button>

                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all opacity-40 hover:opacity-100">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">

                    {/* 1. PERFIL CARD - Resaltado en Blanco */}
                    <div className="bg-white rounded-[24px] p-8 flex justify-between items-start border border-gray-300 shadow-sm">
                        <div className="flex gap-6">
                            <div
                                className="w-20 h-20 rounded-[22px] flex flex-col items-center justify-center shadow-lg transition-colors duration-500"
                                style={{
                                    backgroundColor: dynamicColor,
                                    boxShadow: `0 10px 15px -3px ${dynamicColor}44`
                                }}
                            >
                                <span className="text-white text-3xl font-black leading-none">{candidate.matchScore}%</span>
                                <span className="text-white text-[9px] font-black uppercase mt-1 tracking-widest">Match</span>
                            </div>
                            <div className="flex flex-col gap-1.5 pt-1">
                                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <img src={Icons.auth.mail} className="w-4 h-4" alt="mail" style={blueFilter} />
                                    <span>{candidate.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <img src={Icons.sidebar.vacant} className="w-4 h-4" alt="rol" style={blueFilter} />
                                    <span>UX/UI Designer  •  4 años exp.</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-[#447ECA] text-[10px] font-black uppercase tracking-[2px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            {candidate.status}
                        </span>
                    </div>

                    {/* SECCIÓN DETALLES TÉCNICOS - En Tarjeta Blanca */}
                    <div className="bg-white rounded-[24px] p-10 border border-gray-300 shadow-sm space-y-12">
                        {/* 2. DESGLOSE DEL SCORE */}
                        <section className="px-2">
                            <div className="flex items-center gap-3 mb-8">
                                <img src={Icons.sidebar.history} className="w-4 h-4" alt="score" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Desglose del score</h3>
                            </div>
                            <div className="space-y-4">
                                <ProgressBar label="Hard Skills" current={28} max={30} color="#00FA15" />
                                <ProgressBar label="Experiencia" current={16} max={20} color="#00FA15" />
                                <ProgressBar label="Rol" current={13} max={15} color="#00FA15" />
                                <ProgressBar label="Idiomas" current={12} max={15} color="#00FA15" />
                                <ProgressBar label="Educación" current={9} max={10} color="#00FA15" />
                                <ProgressBar label="Soft Skills" current={7} max={10} color="#F8C807" />
                            </div>
                        </section>

                        {/* 3. HABILIDADES TÉCNICAS - Recuperamos tu bg-[#96FFC1] */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={Icons.stats.posCreatedBlue} className="w-4 h-4" alt="tech" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Habilidades técnicas</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"].map(skill => (
                                    <span key={skill} className="px-5 py-2.5 bg-[#96FFC1] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                ))}
                            </div>
                        </section>

                        {/* 4. TÉCNICAS OPCIONALES - Recuperamos tu bg-[#96FFC1] */}
                        <section>
                            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px] mb-5 pl-1">Habilidades técnicas opcionales</h4>
                            <div className="flex flex-wrap gap-3">
                                {["Adobe Photoshop", "Illustrator", "HTML/CSS"].map(skill => (
                                    <span key={skill} className="px-5 py-2.5 bg-[#96FFC1] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                ))}
                            </div>
                        </section>

                        {/* 5. HABILIDADES BLANDAS - Recuperamos tu bg-[#DCF9FF] */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <img src={Icons.stats.checkBlue} className="w-4 h-4" alt="soft" style={blueFilter} />
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Habilidades blandas</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {["Creatividad", "Empatía", "Comunicación"].map(skill => (
                                    <span key={skill} className="px-5 py-2.5 bg-[#DCF9FF] text-gray-900 text-[13px] font-bold rounded-full border border-black/5 shadow-sm">{skill}</span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* 6. EDUCACIÓN E IDIOMAS */}
                    <section className="bg-white rounded-[24px] p-10 border border-gray-300 shadow-sm grid grid-cols-2 gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <img src={Icons.sidebar.trophy} className="w-4 h-4" alt="edu" style={blueFilter} />
                                <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px]">Educación</h3>
                            </div>
                            <p className="text-gray-900 font-bold text-sm pl-8">Diseño Gráfico y Digital</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <img src={Icons.stats.vacantActiveBlue} className="w-4 h-4" alt="lang" style={blueFilter} />
                                <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-[3px]">Idiomas</h3>
                            </div>
                            <div className="flex gap-2 pl-8">
                                <span className="px-4 py-1.5 bg-[#DCF9FF] rounded-lg text-[12px] font-bold text-gray-900 border border-black/5">Español</span>
                                <span className="px-4 py-1.5 bg-[#DCF9FF] rounded-lg text-[12px] font-bold text-gray-900 border border-black/5">Inglés</span>
                            </div>
                        </div>
                    </section>

                    {/* 7. ANÁLISIS DE IA - Fondo Gris 100 para contraste interno */}
                    <section className="bg-gray-100 rounded-[32px] p-8 border border-gray-300">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={Icons.vacancies.analizCandidates} className="w-6 h-6" alt="ai-analysis" style={blueFilter} />
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[3px]">Análisis de IA</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-gray-400 text-[11px] font-bold uppercase mb-2 pl-1">Resumen</h4>
                                <p className="text-gray-900 font-bold text-[15px] leading-relaxed italic">
                                    "Candidata con excelente perfil de diseño UX/UI. Portfolio diverso con proyectos en fintech y e-commerce. Sus proyectos demuestran capacidad técnica superior."
                                </p>
                            </div>
                            <div>
                                <h4 className="text-gray-400 text-[11px] font-bold uppercase mb-3 pl-1">Proyectos destacados</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-gray-700 font-bold text-sm">
                                        <div className="w-1.5 h-1.5 bg-[#447ECA] rounded-full" />
                                        App móvil fintech premiada en App Store
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 font-bold text-sm">
                                        <div className="w-1.5 h-1.5 bg-[#447ECA] rounded-full" />
                                        Rediseño plataforma e-commerce (Conversión +35%)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer - Sincronizado con Gris 200 */}
                <div className="p-8 border-t border-gray-300 flex justify-end items-center gap-6 bg-gray-200">
                    <button
                        onClick={onClose}
                        className="px-10 py-3.5 bg-[#447ECA] text-white text-[11px] font-black uppercase tracking-[2px] rounded-xl shadow-lg shadow-blue-100 hover:bg-[#3669ab] transition-all active:scale-95">
                        Cerrar Vista
                    </button>
                    <a
                        href={`/api/cv/${candidate.fileName}`}
                        download={candidate.fileName}
                        className="px-10 py-4 bg-[#447ECA] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#3669ab] transition-all active:scale-95">
                        Descargar CV completo
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsModal;