import React from "react";
import { Icons } from "../../assets/icons";
import StatusDropdown from "../ui/StatusDropdown";

// 1. Recibimos onViewClick como prop
const CandidateMatchRow = ({ candidate, index, onStatusChange, onViewClick }) => {
    const getMatchBg = (score) => {
        if (score <= 49) return "bg-[#EF5050]";
        if (score <= 79) return "bg-[#F8C807]";
        return "bg-[#00FA15]";
    };

    return (
        <div className="grid grid-cols-[50px_100px_1fr_280px] gap-4 px-6 py-4 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-all group">

            {/* 1. INDEX */}
            <div className="text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* 2. MATCH BADGE */}
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
                    <img src={Icons.stats.uploadCv} className="w-4 h-4 opacity-60" alt="cv" />
                    <span className="text-gray-500 text-[10px] font-medium">{candidate.fileName}</span>
                </div>
            </div>

            {/* 4. ACCIONES */}
            <div className="flex items-center justify-end gap-4">
                <StatusDropdown
                    currentStatus={candidate.status}
                    onStatusChange={(newStatus) => onStatusChange(candidate.id, newStatus)}
                />

                {/* 2. Conectamos el botón Ver con onViewClick */}
                <button
                    onClick={onViewClick}
                    className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl transition-all group/icon border border-white"
                >
                    <img
                        src={Icons.stats.eyeHistoryGray}
                        className="w-5 h-5 group-hover/icon:opacity-100 transition-opacity"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        alt="ver"
                    />
                </button>

                {/* Botón Descargar */}
                <button
                    className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl transition-all group/icon border border-white"
                    onClick={() => {
                        // Lógica simple para simular descarga
                        alert(`Descargando el CV de ${candidate.name}: ${candidate.fileName}`);
                    }}
                >
                    <img
                        src={Icons.auth.loading}
                        className="w-5 h-5 group-hover/icon:opacity-100 transition-opacity"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        alt="descargar"
                    />
                </button>
            </div>
        </div>
    );
};

export default CandidateMatchRow;