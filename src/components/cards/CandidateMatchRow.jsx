import React from "react";
import { Icons } from "../../assets/icons/index.js";
import StatusDropdown from "../ui/StatusDropdown";

const CandidateMatchRow = ({ candidate, index, onStatusChange }) => {
    const getMatchBg = (score) => {
        if (score <= 49) return "bg-[#EF5050]";
        if (score <= 79) return "bg-[#F8C807]";
        return "bg-[#00FA15]";
    };

    return (
        /* Definición del GRID: 
           Col 1: Index (50px) 
           Col 2: Match (100px)
           Col 3: Info (1fr - flexible)
           Col 4: Acciones + Dropdown (250px) 
        */
        <div className="grid grid-cols-[50px_100px_1fr_250px] gap-4 px-6 py-3 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-all group">

            {/* 1. INDEX */}
            <div className="text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* 2. MATCH BADGE (CUADRADO SÓLIDO) */}
            <div className="flex justify-center">
                <div className={`${getMatchBg(candidate.matchScore)} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg shadow-gray-200`}>
                    <span className="text-white text-2xl font-black leading-none">{candidate.matchScore}%</span>
                    <span className="text-white text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            {/* 3. INFO CANDIDATO */}
            <div className="flex flex-col pl-4">
                <span className="text-gray-800 font-bold text-[15px]">{candidate.name}</span>
                <span className="text-gray-400 text-xs mb-2">{candidate.email}</span>
                <div className="inline-flex items-center gap-2 bg-gray-50 self-start px-2 py-1 rounded-lg border border-gray-100">
                    <img src={Icons.stats.cvs} className="w-4 h-4 opacity-60" alt="cv" />
                    <span className="text-gray-500 text-[10px] font-medium">{candidate.fileName}</span>
                </div>
            </div>

            {/* 4. ACCIONES (DROPDOWN + ICONOS) */}
            <div className="flex items-center justify-end gap-6">
                {/* El Dropdown movido aquí */}
                <StatusDropdown
                    currentStatus={candidate.status}
                    onStatusChange={(val) => onStatusChange(candidate.id, val)}
                />

                {/* Iconos de acción */}
                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 gap-6">
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group/btn">
                        <img src={Icons.stats.eye} className="w-4 h-4 opacity-30 group-hover/btn:opacity-100" alt="ver" />
                    </button>
                    <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group/btn">
                        <img src={Icons.auth.download} className="w-4 h-4 opacity-30 group-hover/btn:opacity-100" alt="descargar" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateMatchRow;