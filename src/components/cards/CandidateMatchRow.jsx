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
        <div className="grid grid-cols-[50px_100px_1fr_280px] gap-4 px-6 py-4 items-center border border-transparent border-b-gray-50 last:border-b-transparent hover:bg-white hover:border-[#447ECA]/30 hover:shadow-xl hover:shadow-blue-900/5 hover:rounded-[22px] transition-all duration-300 group cursor-pointer" onClick={onViewClick}>

            <div className="text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            <div className="flex justify-center">
                <div className={`${bg} ${text} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg border border-black/10`}>
                    <span className="text-2xl font-black leading-none">{score}%</span>
                    <span className="text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            <div className="flex flex-col pl-4">
                <span className="text-gray-800 font-bold text-[15px] group-hover:text-[#447ECA]">
                    {person.fullName || person.name || "Candidato"}
                </span>
                <span className="text-gray-400 text-xs mb-2">{person.email || "Sin contacto"}</span>
                <div className="inline-flex items-center gap-2 bg-gray-50 self-start px-2 py-0.5 rounded-lg border border-gray-100">
                    <img src={Icons.stats.uploadCv} className="w-3 h-3 opacity-60" alt="cv" />
                    <span className="text-gray-500 text-[10px]">{fileName}</span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                <StatusDropdown currentStatus={"OPEN"} onStatusChange={() => { }} />
                <button onClick={onViewClick} className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30">
                    <img src={Icons.stats.eyeHistoryGray} className="w-5 h-5" style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }} alt="ver" />
                </button>
                <a href={person.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30">
                    <img src={Icons.stats.uploadCv} className="w-5 h-5" style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }} alt="doc" />
                </a>
            </div>
        </div>
    );
};

export default CandidateMatchRow;