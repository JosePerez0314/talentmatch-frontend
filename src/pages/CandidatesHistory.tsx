import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, ChevronDown, ChevronUp, Eye, ExternalLink, Loader2 } from "lucide-react";
import { vacanciesApi } from "../services/api/vacancies.api";
import { Vacancy, Candidate } from "../types/api.types";

const AVATAR_PALETTES = [
    { bg: '#DCF9FF', text: '#447ECA' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#EDE7F6', text: '#512DA8' },
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#FCE4EC', text: '#AD1457' },
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#F3E5F5', text: '#6A1B9A' },
    { bg: '#E8EAF6', text: '#283593' },
] as const;

const getAvatarStyle = (idx: number) => AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

const getDisplayName = (c: Candidate): string => {
    if (c.fullName) return c.fullName;
    const parts = [c.firstName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : c.email;
};

const getInitials = (name: string): string =>
    name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();

const formatDate = (iso?: string): string => {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

// ── VacancyGroup ─────────────────────────────────────────────────────────────

interface VacancyGroupProps {
    vacancy: Vacancy;
    paletteIdx: number;
    onNavigate: (vacancyId: number) => void;
}

const VacancyGroup: React.FC<VacancyGroupProps> = ({ vacancy, paletteIdx, onNavigate }) => {
    const [open, setOpen] = useState(true);
    const palette = getAvatarStyle(paletteIdx);
    const candidates = vacancy.candidates ?? [];
    const positionName = vacancy.position?.role ?? "—";
    const departmentName = vacancy.position?.department?.name ?? "";

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Group header */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer select-none"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: palette.bg }}
                    >
                        <Users size={14} style={{ color: palette.text }} />
                    </div>
                    <div className="min-w-0 text-left">
                        <p className="text-sm text-gray-700 truncate">{vacancy.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                            {positionName}{departmentName ? ` · ${departmentName}` : ""}
                        </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                        {candidates.length} candidato{candidates.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onNavigate(vacancy.id); }}
                        className="p-1.5 rounded-lg hover:bg-[#DCF9FF] transition-colors"
                        title="Ver resultados de la vacante"
                    >
                        <ExternalLink size={13} style={{ color: '#447ECA' }} />
                    </button>
                    {open
                        ? <ChevronUp size={15} className="text-gray-400" />
                        : <ChevronDown size={15} className="text-gray-400" />
                    }
                </div>
            </div>

            {/* Candidate rows */}
            {open && (
                <div className="divide-y divide-gray-50">
                    {candidates.map((candidate, cvIdx) => {
                        const name = getDisplayName(candidate);
                        const initials = getInitials(name);
                        const avatarStyle = getAvatarStyle(cvIdx);
                        const isHired = candidate.status === "CONTRATADO";
                        const date = formatDate(candidate.indexedAt ?? candidate.createdAt);

                        return (
                            <div
                                key={candidate.id}
                                className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-[#F0F0F5] transition-colors group"
                            >
                                {/* Avatar */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                                    style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                >
                                    {initials || "?"}
                                </div>

                                {/* Name / email / date */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700">{name}</p>
                                    <p className="text-xs text-gray-400 truncate">{candidate.email}</p>
                                    {date && (
                                        <p className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                                            <Calendar size={10} className="flex-shrink-0" />
                                            Subido: {date}
                                        </p>
                                    )}
                                </div>

                                {/* Niche / role */}
                                {candidate.niche && (
                                    <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0 truncate max-w-[120px]">
                                        {candidate.niche}
                                    </span>
                                )}

                                {/* Status badge */}
                                {isHired ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 flex-shrink-0">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                                        Contratado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500 flex-shrink-0">
                                        Disponible
                                    </span>
                                )}

                                {/* View CV — only if fileUrl exists */}
                                {candidate.fileUrl && (
                                    <a
                                        href={candidate.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg hover:bg-[#DCF9FF] transition-colors opacity-0 group-hover:opacity-100"
                                        title="Ver CV"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Eye size={14} style={{ color: '#447ECA' }} />
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CandidatesHistory: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // GET /vacancies includes the full candidates[] per vacancy — the correct
    // source for a vacancy-grouped view. GET /candidates is read-only and flat.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const data = await vacanciesApi.getAll();
                if (cancelled) return;
                setVacancies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando candidatos:", err);
                if (!cancelled) setError("No pudimos cargar los candidatos.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const vacanciesWithCandidates = useMemo(
        () => vacancies.filter(v => (v.candidates?.length ?? 0) > 0),
        [vacancies],
    );

    const totalCandidates = useMemo(
        () => vacanciesWithCandidates.reduce((sum, v) => sum + (v.candidates?.length ?? 0), 0),
        [vacanciesWithCandidates],
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-gray-800">Candidatos</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {totalCandidates} candidato{totalCandidates !== 1 ? "s" : ""} · {vacanciesWithCandidates.length} vacante{vacanciesWithCandidates.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="bg-white rounded-2xl shadow-sm p-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#447ECA]" size={22} />
                </div>
            )}

            {error && !isLoading && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-4">
                    {error}
                </div>
            )}

            {!isLoading && !error && vacanciesWithCandidates.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-20 flex flex-col items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: '#DCF9FF' }}
                    >
                        <Users size={24} style={{ color: '#447ECA' }} />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Sin candidatos aún</p>
                        <p className="text-gray-400 text-xs">
                            Sube CVs desde el detalle de una vacante para agregar candidatos.
                        </p>
                    </div>
                </div>
            )}

            {!isLoading && !error && vacanciesWithCandidates.length > 0 && (
                <div className="space-y-3">
                    {vacanciesWithCandidates.map((vacancy, i) => (
                        <VacancyGroup
                            key={vacancy.id}
                            vacancy={vacancy}
                            paletteIdx={i}
                            onNavigate={id => navigate(`/advanced-results/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidatesHistory;
