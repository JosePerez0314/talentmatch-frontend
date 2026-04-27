import React from "react";
import { Icons } from "../../assets/icons";
import StatusDropdown from "../ui/StatusDropdown";

const CandidateMatchRow = ({ candidate, index, onStatusChange, onViewClick }) => {

    // Lógica de estilos para el Badge (Feedback de Jose: Contraste y Claridad)
    const getMatchStyles = (score) => {
        if (score <= 49) return { bg: "bg-[#EF5050]", text: "text-white" }; // Rojo -> Texto Blanco
        if (score <= 79) return { bg: "bg-[#F8C807]", text: "text-black" }; // Amarillo -> Texto Negro
        return { bg: "bg-[#00FA15]", text: "text-black" }; // Verde -> Texto Negro
    };

    const { bg, text } = getMatchStyles(candidate.matchScore);

    return (
        <div className="grid grid-cols-[50px_100px_1fr_280px] gap-4 px-6 py-4 items-center border border-transparent border-b-gray-50 last:border-b-transparent hover:bg-white hover:border-[#447ECA]/30 hover:shadow-xl hover:shadow-blue-900/5 hover:rounded-[22px] transition-all duration-300 group cursor-pointer">

            {/* 1. INDEX */}
            <div className="text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* 2. MATCH BADGE - Con borde de seguridad para reducir ruido visual */}
            <div className="flex justify-center">
                <div className={`${bg} ${text} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg shadow-gray-200 border border-black/10`}>
                    <span className="text-2xl font-black leading-none">{candidate.matchScore}%</span>
                    <span className="text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            {/* 3. INFO CANDIDATO */}
            <div className="flex flex-col pl-4" onClick={onViewClick}>
                <span className="text-gray-800 font-bold text-[15px] group-hover:text-[#447ECA] transition-colors">
                    {candidate.name}
                </span>
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

                {/* Botón Ver Análisis (IA) */}
                <button
                    onClick={onViewClick}
                    className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl transition-all group/icon border border-gray-100 hover:border-[#447ECA]/30"
                    title="Ver análisis de IA"
                >
                    <img
                        src={Icons.stats.eyeHistoryGray}
                        className="w-5 h-5 transition-opacity"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        alt="ver-analisis"
                    />
                </button>

                {/* Botón Visualizar Documento (Nuevo Icono y Función preparada) */}
                <button
                    className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl transition-all group/icon border border-gray-100 hover:border-[#447ECA]/30"
                    onClick={(e) => {
                        e.stopPropagation(); // Evita disparar el onClick de la fila
                        alert(`Visualizador: Abriendo ${candidate.fileName}... (Conexión a backend pendiente)`);
                    }}
                    title="Ver documento original"
                >
                    <img
                        src={Icons.stats.uploadCv}
                        className="w-5 h-5 transition-opacity"
                        style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                        alt="ver-documento"
                    />
                </button>
            </div>
        </div>
    );
};

export default CandidateMatchRow;