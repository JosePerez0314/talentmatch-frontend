import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    Eye,
    FileSearch,
    Layers,
    Share2,
    Sparkles,
} from "lucide-react";

import EvaluationCard from "../components/EvaluationCard";
import CandidateDetailsModal from "../components/modals/CandidateDetailsModal";
import { vacanciesApi } from "../services/api/vacancies.api";
import { departmentsApi } from "../services/api/departments.api";
import { ApiError } from "../services/api/apiClient";
import { MatchResult, Vacancy } from "../types/api.types";
import { Department } from "../types/department.types";

// ─── Types ───────────────────────────────────────────────────────────────────

type EvalState = "idle" | "calculating" | "done" | "empty";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
    { bg: "#DCF9FF", text: "#447ECA" },
    { bg: "#E8F5E9", text: "#2E7D32" },
    { bg: "#EDE7F6", text: "#512DA8" },
    { bg: "#FFF3E0", text: "#E65100" },
    { bg: "#FCE4EC", text: "#AD1457" },
    { bg: "#E3F2FD", text: "#1565C0" },
    { bg: "#F3E5F5", text: "#6A1B9A" },
    { bg: "#E8EAF6", text: "#283593" },
];

const CANDIDATE_STATUSES = ["No Contratado", "Contactado", "Contratado"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarStyle = (idx: number) => AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

const getScoreColor = (score: number): string => {
    if (score >= 80) return "#00FA15";
    if (score >= 50) return "#F8C807";
    return "#EF5050";
};

const formatVacancyCode = (id: number): string =>
    `Vac-${String(id).padStart(3, "0")}`;

const getCandidateName = (match: MatchResult): string => {
    const c = match.candidate;
    if (!c) return "Candidato";
    return (
        c.fullName ||
        [c.firstName, c.lastName].filter(Boolean).join(" ") ||
        c.email
    );
};

const getStatusStyle = (status: string): string => {
    if (status === "Contratado") return "text-green-600 bg-green-50 border-green-200";
    if (status === "Contactado") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
};

// ─── CircleScore ──────────────────────────────────────────────────────────────

const CircleScore: React.FC<{ score: number }> = React.memo(({ score }) => {
    const r = 30;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = getScoreColor(score);

    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
            </svg>
            <div className="flex flex-col items-center leading-none">
                <span className="text-sm font-semibold text-gray-800">{score}%</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Match</span>
            </div>
        </div>
    );
});

CircleScore.displayName = "CircleScore";

// ─── Main Component ───────────────────────────────────────────────────────────

const EvaluationsHistory: React.FC = () => {
    const navigate = useNavigate();

    // Initial data
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // State machine
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [evalState, setEvalState] = useState<EvalState>("idle");
    const [results, setResults] = useState<MatchResult[]>([]);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [evalError, setEvalError] = useState<string | null>(null);

    // UI
    const [candidateStatuses, setCandidateStatuses] = useState<Map<number, string>>(new Map());
    const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [shareMsg, setShareMsg] = useState<string | null>(null);

    const resultsRef = useRef<HTMLDivElement>(null);

    // ── Close dropdown when clicking outside ─────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusDropdownId !== null) {
                const target = e.target as HTMLElement;
                if (!target.closest(".status-dropdown-container")) {
                    setStatusDropdownId(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [statusDropdownId]);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const [vacs, depts] = await Promise.all([
                    vacanciesApi.getAll(),
                    departmentsApi.getAll(),
                ]);
                if (cancelled) return;
                setVacancies(vacs);
                setDepartments(depts);
            } catch {
                if (!cancelled)
                    setLoadError("No pudimos cargar las vacantes. Intenta de nuevo más tarde.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // ── Derived ───────────────────────────────────────────────────────────────
    const activeVacancies = useMemo(
        () => vacancies.filter((v) => v.status === "ACTIVE"),
        [vacancies],
    );

    const departmentsById = useMemo(() => {
        const map = new Map<string, Department>();
        departments.forEach((d) => map.set(String(d.id), d));
        return map;
    }, [departments]);

    const evaluationVacancies = useMemo(
        () =>
            activeVacancies.map((v) => ({
                id: String(v.id),
                title: v.title,
                roleDescription: v.position?.role ?? "",
                vacancyCode: formatVacancyCode(v.id),
                department:
                    v.position?.department?.name ??
                    departmentsById.get(String(v.departmentId))?.name ??
                    "Sin departamento",
                candidatesCount: v._count?.candidates ?? 0,
                status: "Activa" as const,
            })),
        [activeVacancies, departmentsById],
    );

    // ── Evaluation logic ──────────────────────────────────────────────────────
    const runEvaluation = async (vacancy: Vacancy, isRecalc = false) => {
        if (isRecalc) {
            setIsRecalculating(true);
        } else {
            setSelectedVacancy(vacancy);
            setEvalState("calculating");
            setEvalError(null);
            setCandidateStatuses(new Map());
            setStatusDropdownId(null);
        }

        try {
            try {
                await vacanciesApi.evaluateCandidates(vacancy.id);
            } catch (err) {
                if (!(err instanceof ApiError && err.status === 400)) throw err;
            }

            const data = await vacanciesApi.getResults(vacancy.id, 1, 10);
            const list = Array.isArray(data) ? data : [];
            setResults(list);

            if (!isRecalc) {
                setEvalState(list.length > 0 ? "done" : "empty");
            }
        } catch (err) {
            console.error("Error en evaluación:", err);
            if (!isRecalc) {
                setEvalError("No se pudo completar la evaluación. Intenta de nuevo.");
                setEvalState("idle");
                setSelectedVacancy(null);
            }
        } finally {
            if (isRecalc) setIsRecalculating(false);
        }
    };

    const handleBack = () => {
        setSelectedVacancy(null);
        setEvalState("idle");
        setResults([]);
        setEvalError(null);
        setCandidateStatuses(new Map());
        setStatusDropdownId(null);
        setSelectedMatch(null);
        setIsModalOpen(false);
    };

    const handleStatusChange = (matchId: number, status: string) => {
        setCandidateStatuses((prev) => new Map(prev).set(matchId, status));
        setStatusDropdownId(null);
    };

    // ── Screenshot → clipboard ────────────────────────────────────────────────
    const handleShare = async () => {
        if (!resultsRef.current) return;

        // Cerrar menús desplegables abiertos antes de capturar
        setStatusDropdownId(null);
        setIsSharing(true);
        setShareMsg(null);

        try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(resultsRef.current, { pixelRatio: 2 });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
            ]);
            setShareMsg("¡Imagen copiada al portapapeles!");
        } catch {
            setShareMsg("No se pudo copiar la imagen. Verifica los permisos del navegador.");
        } finally {
            setIsSharing(false);
            window.setTimeout(() => setShareMsg(null), 3500);
        }
    };

    // ── IDLE ──────────────────────────────────────────────────────────────────
    if (evalState === "idle") {
        return (
            <div className="min-h-screen bg-[#f0f0f5] text-slate-600 p-8 w-full">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Evaluaciones
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">
                            Selecciona una vacante activa para calcular el ranking de candidatos.
                        </p>
                    </div>

                    {evalError && (
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium">
                            {evalError}
                        </div>
                    )}

                    {isLoading && (
                        <p className="text-sm text-slate-400 font-medium animate-pulse">
                            Cargando vacantes...
                        </p>
                    )}

                    {loadError && !isLoading && (
                        <p className="text-sm text-red-500 font-medium">{loadError}</p>
                    )}

                    {!isLoading && !loadError && activeVacancies.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-20 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#DCF9FF]">
                                <FileSearch size={24} className="text-[#447ECA]" />
                            </div>
                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-1 font-medium">
                                    No hay vacantes activas
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Crea o activa una vacante para poder evaluar candidatos.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/vacancy")}
                                className="flex items-center gap-2 px-5 py-2.5 text-white bg-[#447ECA] hover:bg-[#3a6bb8] rounded-xl text-sm font-medium transition-colors"
                            >
                                <Sparkles size={14} /> Nueva Vacante
                            </button>
                        </div>
                    )}

                    {!isLoading && !loadError && (
                        <div className="space-y-3">
                            {evaluationVacancies.map((vacancy) => (
                                <EvaluationCard
                                    key={vacancy.id}
                                    vacancy={vacancy}
                                    onCalculate={(vacancyId) => {
                                        const vac = activeVacancies.find(
                                            (v) => String(v.id) === vacancyId,
                                        );
                                        if (vac) runEvaluation(vac);
                                    }}
                                    isCalculating={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── CALCULATING ───────────────────────────────────────────────────────────
    if (evalState === "calculating") {
        return (
            <div className="min-h-screen bg-[#f0f0f5] p-8 w-full flex items-start pt-24 justify-center">
                <div className="w-full max-w-2xl">
                    <div className="bg-[#2d2d2d] rounded-2xl p-14 flex flex-col items-center justify-center gap-5 min-h-72">
                        <div className="space-y-2 text-center">
                            <p className="text-white text-lg font-medium">
                                Calculando MatchScores (IA)
                            </p>
                            <p className="text-gray-400 text-sm">
                                Evaluando candidatos para{" "}
                                <span className="text-white font-medium">
                                    {selectedVacancy?.title}
                                </span>
                                …
                            </p>
                        </div>
                        <div className="w-10 h-10 border-4 border-[#447ECA] border-t-transparent rounded-full animate-spin mt-2" />
                    </div>
                </div>
            </div>
        );
    }

    // ── EMPTY ─────────────────────────────────────────────────────────────────
    if (evalState === "empty") {
        return (
            <div className="min-h-screen bg-[#f0f0f5] p-8 w-full">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 mb-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={15} /> Volver al historial
                    </button>
                    <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                        <p className="text-gray-600 mb-1 font-medium">Sin resultados</p>
                        <p className="text-gray-400 text-sm">
                            Los candidatos no tienen suficientes datos para el emparejamiento.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── DONE ──────────────────────────────────────────────────────────────────
    const deptName =
        selectedVacancy?.position?.department?.name ??
        departmentsById.get(String(selectedVacancy?.departmentId))?.name ??
        null;

    return (
        <div className="min-h-screen bg-[#f0f0f5] p-8 w-full">
            {/* Share feedback toast */}
            {shareMsg && (
                <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-xl">
                    {shareMsg}
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                {/* Action bar */}
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6 flex-wrap bg-[#f0f0f5]">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={15} /> Volver al historial
                    </button>

                    <div className="flex-1 flex justify-center min-w-0">
                        <div className="min-w-0 text-center">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-800 truncate">
                                    {selectedVacancy?.title}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                                    Activa
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {selectedVacancy && formatVacancyCode(selectedVacancy.id)}
                                {deptName && (
                                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#447ECA]">
                                        <Layers size={10} className="inline" /> {deptName}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
                            title="Capturar candidatos y copiar imagen al portapapeles"
                        >
                            <Share2 size={14} />
                            <span className="hidden sm:inline">
                                {isSharing ? "Capturando…" : "Compartir"}
                            </span>
                        </button>

                        <button
                            onClick={() => selectedVacancy && runEvaluation(selectedVacancy, true)}
                            disabled={isRecalculating}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#447ECA] hover:bg-[#3a6bb8] rounded-xl transition-colors disabled:opacity-60"
                        >
                            {isRecalculating ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Calculando…
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Recalcular MatchScore
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recalculating overlay */}
                {isRecalculating && (
                    <div className="bg-[#2d2d2d] rounded-2xl p-12 flex flex-col items-center justify-center gap-5 mb-6">
                        <div className="text-center space-y-1">
                            <p className="text-white text-base font-medium">
                                Recalculando MatchScores
                            </p>
                            <p className="text-gray-400 text-sm">
                                Evaluando candidatos para {selectedVacancy?.title}…
                            </p>
                        </div>
                        <div className="w-9 h-9 border-4 border-[#447ECA] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isRecalculating && (
                    <>
                        {/* Info banner */}
                        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl mb-5 bg-[#EFF6FF] border border-[#BFDBFE]">
                            <Sparkles size={14} className="flex-shrink-0 mt-0.5 text-[#447ECA]" />
                            <p className="text-xs text-[#1E40AF]">
                                Mostrando el <strong>Top 10</strong> de candidatos con mayor
                                compatibilidad con los requisitos de la posición.
                            </p>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            <span className="text-[#447ECA]">{results.length} candidatos</span>{" "}
                            evaluados
                        </p>

                        {/* Candidate cards — this div is captured by the screenshot */}
                        <div
                            ref={resultsRef}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1"
                        >
                            {results.map((result, idx) => {
                                const avatarStyle = getAvatarStyle(idx);
                                const name = getCandidateName(result);
                                const initials = name
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((n) => n[0].toUpperCase())
                                    .join("");
                                const currentStatus =
                                    candidateStatuses.get(result.id) ?? "No Contratado";

                                return (
                                    <div
                                        key={result.id}
                                        className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs select-none font-semibold"
                                                style={{
                                                    backgroundColor: avatarStyle.bg,
                                                    color: avatarStyle.text,
                                                }}
                                            >
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {result.candidate?.email ?? ""}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-300 tabular-nums flex-shrink-0 select-none">
                                                #{idx + 1}
                                            </span>
                                        </div>

                                        {/* Score ring */}
                                        <div className="flex justify-center py-1">
                                            <CircleScore score={result.matchScore} />
                                        </div>

                                        {/* Niche tag */}
                                        {result.candidate?.niche && (
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] leading-none font-medium w-fit"
                                                style={{
                                                    backgroundColor: avatarStyle.bg,
                                                    color: avatarStyle.text,
                                                }}
                                            >
                                                {result.candidate.niche}
                                            </span>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                                            {/* Status dropdown */}
                                            <div className="relative flex-shrink-0 status-dropdown-container">
                                                <button
                                                    onClick={() =>
                                                        setStatusDropdownId(
                                                            statusDropdownId === result.id
                                                                ? null
                                                                : result.id,
                                                        )
                                                    }
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-colors ${getStatusStyle(currentStatus)}`}
                                                >
                                                    {currentStatus}
                                                    <ChevronDown size={9} />
                                                </button>

                                                {statusDropdownId === result.id && (
                                                    <div className="absolute left-0 bottom-full mb-1 z-20 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-36">
                                                        {CANDIDATE_STATUSES.map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() =>
                                                                    handleStatusChange(result.id, s)
                                                                }
                                                                className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 text-gray-700 transition-colors"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ver perfil */}
                                            <button
                                                onClick={() => {
                                                    setSelectedMatch(result);
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] text-white bg-[#447ECA] hover:bg-[#3a6bb8] transition-colors flex-shrink-0"
                                            >
                                                <Eye size={11} /> Ver perfil
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <CandidateDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedMatch}
            />
        </div>
    );
};

export default EvaluationsHistory;
