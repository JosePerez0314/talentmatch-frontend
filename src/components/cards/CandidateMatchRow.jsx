import React from "react";
import { Icons } from "../../assets/icons";
import StatusDropdown from "../ui/StatusDropdown";

const CandidateMatchRow = ({ resultData, index, onViewClick }) => {
    const person = resultData.candidate || resultData || {};
    const score = resultData.matchScore || resultData.overallScore || person.score || 0;
    const fileName = person.fileUrl ? person.fileUrl.split('/').pop() : "CV.pdf";

    const getMatchStyles = (s) => {
        if (s <= 49) return { bg: "bg-[#EF5050]", text: "text-white" };
        if (s <= 79) return { bg: "bg-[#F8C807]", text: "text-black" };
        return { bg: "bg-[#00FA15]", text: "text-black" };
    };

    const { bg, text } = getMatchStyles(score);

    return (
        /* Cambiamos a grid de 1 col en móvil y el grid complejo en md: */
        <div
            className="grid grid-cols-1 md:grid-cols-[50px_100px_1fr_280px] gap-4 px-4 md:px-6 py-6 md:py-4 items-center border border-transparent border-b-gray-50 last:border-b-transparent hover:bg-white hover:border-[#447ECA]/30 hover:shadow-xl hover:shadow-blue-900/5 hover:rounded-[22px] transition-all duration-300 group cursor-pointer"
            onClick={onViewClick}
        >

            {/* Ocultamos el número en móvil para ganar espacio o lo centramos */}
            <div className="hidden md:block text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Score: Centrado en móvil */}
            <div className="flex justify-center">
                <div className={`${bg} ${text} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg border border-black/10`}>
                    <span className="text-2xl font-black leading-none">{score}%</span>
                    <span className="text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            {/* Info del candidato: Centrada en móvil, izquierda en desktop */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:pl-4">
                <span className="text-gray-800 font-bold text-[15px] group-hover:text-[#447ECA] break-all">
                    {person.fullName || person.name || "Candidato"}
                </span>
                <span className="text-gray-400 text-xs mb-2 break-all">{person.email || "Sin contacto"}</span>
                <div className="inline-flex items-center gap-2 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 max-w-full">
                    <img src={Icons.stats.uploadCv} className="w-3 h-3 opacity-60" alt="cv" />
                    <span className="text-gray-500 text-[10px] truncate max-w-[150px] md:max-w-none">{fileName}</span>
                </div>
            </div>

            {/* Acciones: Se envuelven (wrap) en móvil para que no se salgan */}
            <div
                className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 mt-2 md:mt-0"
                onClick={(e) => e.stopPropagation()}
            >
                <StatusDropdown currentStatus={"OPEN"} onStatusChange={() => { }} />

                <div className="flex gap-2">
                    <button
                        onClick={onViewClick}
                        className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30 transition-colors"
                    >
                        <img
                            src={Icons.stats.eyeHistoryGray}
                            className="w-5 h-5"
                            style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                            alt="ver"
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
                            style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                            alt="doc"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CandidateMatchRow;