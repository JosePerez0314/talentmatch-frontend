import React from "react";
import { Icons } from "../../assets/icons";
import StatusDropdown from "../ui/StatusDropdown";

// CORRECCIÓN: Se cambia onStatusUpdate por onStatusChange para que coincida con la llamada interna
const CandidateMatchRow = ({ resultData, index, onViewClick, onStatusChange }) => {
    // REFERENCIAS CORREGIDAS SEGÚN JSON DE POSTMAN
    const person = resultData.candidate || {};
    // El backend usa matchScore para el porcentaje
    const score = resultData.matchScore || 0;
    // Las habilidades están en normalizedCandidate.technicalSkills
    const skills = resultData.normalizedCandidate?.technicalSkills || [];
    const fileName = person.fileUrl ? person.fileUrl.split('/').pop() : "CV.pdf";

    // Extraemos el ID del candidato y su estado actual para la persistencia
    const candidateId = person.id || person._id;
    const currentStatus = person.status || "No contratado";

    const getMatchStyles = (s) => {
        if (s <= 49) return { bg: "bg-[#EF5050]", text: "text-white" };
        if (s <= 79) return { bg: "bg-[#F8C807]", text: "text-black" };
        return { bg: "bg-[#00FA15]", text: "text-black" };
    };

    const { bg, text } = getMatchStyles(score);

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-[50px_100px_1fr_280px] gap-4 px-4 md:px-6 py-6 md:py-4 items-center border border-transparent border-b-gray-50 last:border-b-transparent hover:bg-white hover:border-[#447ECA]/30 hover:shadow-xl hover:shadow-blue-900/5 hover:rounded-[22px] transition-all duration-300 group cursor-pointer"
            onClick={onViewClick}
        >

            {/* Index Number */}
            <div className="hidden md:block text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Score */}
            <div className="flex justify-center">
                <div className={`${bg} ${text} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg border border-black/10`}>
                    <span className="text-2xl font-black leading-none">{score}%</span>
                    <span className="text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            {/* Info del candidato */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:pl-4 min-w-0 overflow-hidden">
                <span className="w-full text-gray-800 font-bold text-[15px] group-hover:text-[#447ECA] truncate">
                    {person.fullName || "Candidato"}
                </span>

                {/* Mapeo de Skills (technicalSkills del JSON) */}
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-[#447ECA] text-[9px] font-bold rounded-md uppercase border border-blue-100">
                            {skill}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="text-[9px] text-gray-400 font-bold">+{skills.length - 3}</span>
                    )}
                </div>

                <div className="inline-flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 max-w-full overflow-hidden">
                    <img src={Icons.stats.uploadCv} className="w-3 h-3 opacity-60 flex-shrink-0" alt="cv" />
                    <span className="text-gray-500 text-[10px] truncate italic">
                        {fileName}
                    </span>
                </div>
            </div>

            {/* Acciones */}
            <div
                className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 mt-2 md:mt-0 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ahora onStatusChange está correctamente definido en las props */}
                <StatusDropdown
                    currentStatus={currentStatus}
                    onStatusChange={(newStatus) => onStatusChange?.(candidateId, newStatus)}
                />

                <div className="flex gap-2">
                    <button
                        onClick={onViewClick}
                        className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30 transition-colors"
                    >
                        <img
                            src={Icons.stats.eyeHistoryGray}
                            className="w-5 h-5"
                            alt="ver"
                            style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        />
                    </button>
                    <a
                        href={person.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30 transition-colors"
                    >
                        <img
                            src={Icons.stats.uploadCv}
                            className="w-5 h-5"
                            alt="doc"
                            style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CandidateMatchRow;