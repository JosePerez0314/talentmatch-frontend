import React from "react";
import { Icons } from "../../assets/icons/index";
import { MatchResult } from "../../types/api.types";

interface NormalizedCandidate {
    technicalSkills?: string[];
}

// MatchResult on the results endpoint is enriched with normalizedCandidate
// and the backend still returns fileUrl on the candidate — kept as widened
// access to avoid a regression while the shared types catch up.
type ResultData = MatchResult & {
    normalizedCandidate?: NormalizedCandidate;
    candidate?: MatchResult["candidate"] & { fileUrl?: string };
};

interface CandidateMatchRowProps {
    resultData: ResultData;
    index: number;
    onViewClick: () => void;
    onHire?: () => void;
    isHiring?: boolean;
    hireDisabled?: boolean;
}

const getMatchStyles = (score: number): { bg: string; text: string } => {
    if (score <= 49) return { bg: "bg-[#EF5050]", text: "text-white" };
    if (score <= 79) return { bg: "bg-[#F8C807]", text: "text-black" };
    return { bg: "bg-[#00FA15]", text: "text-black" };
};

const CandidateMatchRow: React.FC<CandidateMatchRowProps> = ({
    resultData,
    index,
    onViewClick,
    onHire,
    isHiring = false,
    hireDisabled = false,
}) => {
    const person = resultData.candidate;
    const score = resultData.matchScore ?? 0;
    const skills = resultData.normalizedCandidate?.technicalSkills ?? [];
    const fileUrl = person?.resumeUrl ?? person?.fileUrl;
    const fileName = fileUrl ? fileUrl.split("/").pop() : "CV.pdf";

    const displayName = person?.fullName
        ?? [person?.firstName, person?.lastName].filter(Boolean).join(" ")
        ?? "Candidato";

    const { bg, text } = getMatchStyles(score);

    return (
        <div
            className="grid grid-cols-1 md:grid-cols-[50px_100px_1fr_280px] gap-4 px-4 md:px-6 py-6 md:py-4 items-center border border-transparent border-b-gray-50 last:border-b-transparent hover:bg-white hover:border-[#447ECA]/30 hover:shadow-xl hover:shadow-blue-900/5 hover:rounded-[22px] transition-all duration-300 group cursor-pointer"
            onClick={onViewClick}
        >

            <div className="hidden md:block text-gray-900 font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
            </div>

            <div className="flex justify-center">
                <div className={`${bg} ${text} w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shadow-lg border border-black/10`}>
                    <span className="text-2xl font-black leading-none">{score}%</span>
                    <span className="text-[8px] font-black uppercase mt-1">Match</span>
                </div>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left md:pl-4 min-w-0 overflow-hidden">
                <span className="w-full text-gray-800 font-bold text-[15px] group-hover:text-[#447ECA] truncate">
                    {displayName}
                </span>

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

            <div
                className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 mt-2 md:mt-0 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => onHire?.()}
                    disabled={isHiring || hireDisabled}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isHiring ? "Contratando..." : "Contratar"}
                </button>

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
                    {fileUrl && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white hover:bg-[#DCF9FF] rounded-xl border border-gray-100 hover:border-[#447ECA]/30 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={Icons.stats.uploadCv}
                                className="w-5 h-5"
                                alt="doc"
                                style={{ filter: "invert(42%) sepia(85%) saturate(1212%) hue-rotate(189deg) brightness(91%) contrast(85%)" }}
                            />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateMatchRow;
