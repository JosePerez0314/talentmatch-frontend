import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, Calendar, Eye, Upload, Search, Download, X, FileText, BarChart2 } from "lucide-react";

import CandidateDetailsModal from "../components/modals/CandidateDetailsModal";
import { ApiError } from "../services/api/apiClient";
import { vacanciesApi } from "../services/api/vacancies.api";
import { departmentsApi } from "../services/api/departments.api";
import { Application, ApplicationStatus, Candidate, MatchResult, UploadResult, Vacancy } from "../types/api.types";

const formatDate = (iso?: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatVacancyDate = (iso?: string): string => {
    if (!iso) return "";
    return iso.split("T")[0].split("-").reverse().join("/");
};

const formatVacancyCode = (id: number): string => `Vac-${String(id).padStart(3, "0")}`;

const getInitials = (name: string): string =>
    name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

const getScoreColor = (score: number): string => {
    if (score >= 80) return "#00FA15";
    if (score >= 50) return "#F8C807";
    return "#EF5050";
};

const getStatusStyle = (status: string): string => {
    switch (status) {
        case "SELECCIONADO": return "bg-green-50 border-green-200 text-green-700";
        case "EN_PROCESO":   return "bg-blue-50 border-blue-200 text-blue-700";
        case "RECHAZADO":    return "bg-red-50 border-red-200 text-red-600";
        default:             return "bg-gray-50 border-gray-200 text-gray-600";
    }
};

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

const getAvatarStyle = (idx: number) => AVATAR_PALETTES[idx % AVATAR_PALETTES.length];

interface UploadQueueItem {
    name: string;
    status: "pending" | "done" | "failed";
}

const AdvancedResults: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [evaluatedCandidates, setEvaluatedCandidates] = useState<MatchResult[]>([]);
    // Candidates accumulated from upload responses and/or vacancy.candidates from the backend
    const [localCandidates, setLocalCandidates] = useState<Candidate[]>([]);
    const [departmentName, setDepartmentName] = useState<string>("");
    const [candidateStatuses, setCandidateStatuses] = useState<Map<number, ApplicationStatus>>(new Map());
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const allCandidates: Candidate[] = localCandidates;

    const loadData = useCallback(async (vacancyId: string) => {
        const [results, vac, allVacancies] = await Promise.all([
            vacanciesApi.getResults(vacancyId).catch(() => []),
            vacanciesApi.getById(vacancyId).catch(() => null),
            vacanciesApi.getAll().catch(() => []),
        ]);
        setEvaluatedCandidates(Array.isArray(results) ? results : []);
        // GET /vacancies/:id doesn't document returning `position`/`candidates` (only the list
        // endpoint does, per api-documentation.md §4), so prefer the matching list entry when found.
        const vacancyFromList = allVacancies.find(v => String(v.id) === String(vacancyId));
        const resolvedVacancy = vacancyFromList ?? vac;
        setVacancy(resolvedVacancy);
        // Always reset (never leave a previous vacancy's candidates showing when this one has none)
        setLocalCandidates(resolvedVacancy?.candidates ?? []);
        return resolvedVacancy;
    }, []);

    useEffect(() => {
        let cancelled = false;
        // AdvancedResults is reused by the router across /advanced-results/:id navigations
        // (only the param changes), so per-vacancy UI state must be reset explicitly here.
        setCandidateStatuses(new Map());
        setSearchQuery("");
        setSelectedMatch(null);
        setIsModalOpen(false);
        (async () => {
            if (!id) { setLoading(false); return; }
            try {
                setLoading(true);
                const vac = await loadData(id);
                if (cancelled) return;
                if (vac?.departmentId != null) {
                    try {
                        const depts = await departmentsApi.getAll();
                        if (!cancelled) {
                            setDepartmentName(
                                depts.find(d => String(d.id) === String(vac.departmentId))?.name ?? ""
                            );
                        }
                    } catch { /* non-critical */ }
                }
            } catch (err) {
                console.error("Error cargando resultados:", err);
                if (!cancelled) setError("No pudimos cargar los resultados de esta vacante.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id, loadData]);

    // Seed candidateStatuses from the applications array returned by getResults.
    // Only fills entries not already in the map so user changes aren't overwritten on re-render.
    useEffect(() => {
        setCandidateStatuses(prev => {
            const next = new Map(prev);
            for (const m of evaluatedCandidates) {
                const cId = m.candidate?.id;
                const appStatus = (m.candidate?.applications as Application[] | undefined)?.[0]?.status;
                if (cId != null && appStatus && !next.has(cId)) {
                    next.set(cId, appStatus);
                }
            }
            return next;
        });
    }, [evaluatedCandidates]);

    // Upload CVs without triggering evaluation — evaluation is explicit via Recalcular button.
    // Candidates are extracted directly from the upload response so they appear immediately
    // without relying on getById returning the candidates array.
    const handleFilesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !id) return;
        const fileArr = Array.from(files);
        setError(null);
        setIsUploading(true);
        setUploadQueue(fileArr.map(f => ({ name: f.name, status: "pending" })));
        try {
            const results: UploadResult[] = await vacanciesApi.uploadCVs(id, fileArr);
            // Assumes the backend returns one UploadResult per file, in the same order it received them
            setUploadQueue(fileArr.map((f, i) => ({
                name: f.name,
                status: results[i]?.success ? "done" : "failed",
            })));
            const uploaded: Candidate[] = results.flatMap(r =>
                r.success && r.data ? [r.data] : []
            );
            if (uploaded.length > 0) {
                setLocalCandidates(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    return [...prev, ...uploaded.filter(c => !existingIds.has(c.id))];
                });
            }
            const failed = results.filter(r => !r.success);
            if (failed.length > 0) {
                const reasons = failed.map(r => {
                    // `error` carries the real failure detail; `message` is often a fixed generic string
                    if (r.error && r.message && r.error !== r.message) return `${r.error} (${r.message})`;
                    return r.error ?? r.message ?? "Error desconocido";
                }).join(" | ");
                setError(
                    uploaded.length > 0
                        ? `${uploaded.length} CV(s) procesado(s). ${failed.length} falló: ${reasons}`
                        : `No se pudo procesar el CV: ${reasons}`
                );
            }
            setTimeout(() => {
                setShowDropzone(false);
                setUploadQueue([]);
            }, 900);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al subir los CVs.");
            setUploadQueue([]);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRecalculate = async () => {
        if (!id) return;
        setError(null);
        setIsRecalculating(true);
        try {
            await vacanciesApi.evaluateCandidates(id);
            await loadData(id);
        } catch (err) {
            console.error("Error recalculando:", err);
            setError("No se pudo recalcular el match score.");
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleUpdateStatus = async (candidateId: number, newStatus: ApplicationStatus) => {
        if (!id) return;
        const previous = candidateStatuses.get(candidateId);
        setCandidateStatuses(prev => new Map(prev).set(candidateId, newStatus));
        try {
            const result = await vacanciesApi.updateCandidateStatus(id, candidateId, newStatus);
            if (result.vacancy.status !== vacancy?.status) {
                setVacancy(prev => prev ? { ...prev, status: result.vacancy.status, availableSlots: result.vacancy.availableSlots } : prev);
            }
        } catch (err) {
            setCandidateStatuses(prev => {
                const next = new Map(prev);
                previous != null ? next.set(candidateId, previous) : next.delete(candidateId);
                return next;
            });
            if (err instanceof ApiError && err.status === 409) {
                setError(vacancy?.status === 'CLOSED'
                    ? "La vacante está cerrada. Reactívala para cambiar estados."
                    : "No hay cupos disponibles para seleccionar más candidatos.");
            } else if (err instanceof ApiError && err.status === 404) {
                setError("Este candidato no tiene un registro activo para esta vacante. Re-sube su CV y recalcula para habilitarlo.");
            } else {
                setError("No se pudo actualizar el estado del candidato.");
            }
        }
    };

    const lq = searchQuery.toLowerCase();
    const filteredAll = allCandidates.filter(c =>
        (c.fullName ?? "").toLowerCase().includes(lq) ||
        (c.niche ?? "").toLowerCase().includes(lq)
    );
    const filteredEvaluated = [...evaluatedCandidates]
        .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
        .filter(m =>
            (m.candidate?.fullName ?? "").toLowerCase().includes(lq) ||
            (m.candidate?.niche ?? "").toLowerCase().includes(lq)
        );

    const isClosed = vacancy?.status === "CLOSED";
    const isPaused = vacancy?.status === "PAUSED";
    const hasPendingCandidates = allCandidates.some(
        c => !evaluatedCandidates.some(m => m.candidate?.id === c.id)
    );
    const recalculateDisabledReason =
        allCandidates.length === 0
            ? "Sube al menos un CV para calcular"
            : !hasPendingCandidates
                ? "Todos los candidatos ya fueron evaluados. Sube un nuevo CV para recalcular."
                : undefined;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <p className="text-gray-500 font-medium animate-pulse">Cargando módulo de análisis...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <header className="flex items-center justify-between mb-6 gap-4">
                    <button
                        onClick={() => navigate("/vacancy-history")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors shrink-0"
                    >
                        <ArrowLeft size={18} /> Volver a Vacantes
                    </button>

                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-lg font-bold text-gray-800">
                                {vacancy?.title ?? "—"}
                            </h1>
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${isClosed ? "bg-slate-200 text-slate-600"
                                    : isPaused ? "bg-amber-100 text-amber-700"
                                        : "bg-[#DCFCE7] text-[#16A34A]"
                                }`}>
                                {isClosed ? "Cerrada" : isPaused ? "Pausada" : "Abierta"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-0.5 flex items-center gap-1.5 justify-center">
                            {vacancy ? formatVacancyCode(vacancy.id) : "—"}
                            <span className="opacity-40">•</span>
                            <Layers size={11} className="opacity-50" />
                            {departmentName}
                        </p>
                    </div>

                    <div title={recalculateDisabledReason} className="shrink-0">
                        <button
                            onClick={handleRecalculate}
                            disabled={isRecalculating || isClosed || isPaused || allCandidates.length === 0 || !hasPendingCandidates}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#447ECA] text-white rounded-xl font-bold shadow-sm hover:bg-[#3669ab] transition-all text-xs disabled:opacity-40"
                        >
                            <Sparkles size={14} />
                            {isRecalculating ? "Recalculando..." : "Recalcular MatchScore (IA)"}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm font-medium mb-4">
                        {error}
                    </div>
                )}

                {/* VACANCY INFO ROW */}
                <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Posición</p>
                        <p className="text-sm font-medium text-gray-800">{vacancy?.position?.role ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Departamento</p>
                        <p className="text-sm font-medium text-gray-800">{departmentName || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cupos</p>
                        <p className="text-sm font-medium text-gray-800">{vacancy?.availableSlots ?? "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fechas</p>
                        <p className="text-sm font-medium text-gray-800">
                            {formatVacancyDate(vacancy?.startDate)} → {formatVacancyDate(vacancy?.endDate)}
                        </p>
                    </div>
                </section>

                {/* SECTION 1: ALL UPLOADED CANDIDATES (simple list, no score) */}
                <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">Candidatos de esta Vacante</span>
                            <span className="bg-[#E0F2FE] text-[#0369A1] text-xs font-bold px-2 py-0.5 rounded-full">
                                {filteredAll.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={e => handleFilesUpload(e.target.files)}
                            />
                            <button
                                onClick={() => setShowDropzone(prev => !prev)}
                                disabled={isUploading || isClosed}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-40"
                            >
                                <Upload size={13} />
                                {isUploading ? "Subiendo..." : "Subir CVs"}
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar candidato por nombre o rol..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#447ECA] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Dropzone */}
                    {showDropzone && (
                        <div className="mb-3">
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFilesUpload(e.dataTransfer.files);
                                }}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer flex flex-col items-center gap-2 transition-all ${isDragging
                                    ? "border-[#447ECA] bg-[#F0F7FF]"
                                    : "border-gray-200 bg-[#F8FAFC] hover:bg-[#F1F5F9]"
                                    }`}
                            >
                                <Upload className="text-gray-300" size={24} />
                                <p className="text-sm text-gray-500">
                                    Arrastra PDFs aquí o{" "}
                                    <span className="text-[#447ECA] font-bold">haz clic para seleccionar</span>
                                </p>
                                <p className="text-[11px] text-gray-400">Solo archivos PDF</p>
                            </div>

                            {uploadQueue.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {uploadQueue.map((q, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <FileText size={13} className="text-gray-400 shrink-0" />
                                            <span className="flex-1 truncate text-gray-600 text-xs">{q.name}</span>
                                            {q.status === "done" && (
                                                <span className="text-xs text-green-600 shrink-0">✓ Procesado</span>
                                            )}
                                            {q.status === "failed" && (
                                                <span className="text-xs text-red-500 shrink-0">✗ Falló</span>
                                            )}
                                            {q.status === "pending" && (
                                                <span className="w-3 h-3 border-2 border-[#447ECA] border-t-transparent rounded-full animate-spin shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Candidate rows */}
                    {filteredAll.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            {allCandidates.length === 0
                                ? "Aún no hay candidatos. Sube CVs para comenzar."
                                : "Ningún candidato coincide con la búsqueda."}
                        </p>
                    ) : (
                        <div
                            className="divide-y divide-gray-50 overflow-y-auto"
                            style={{ maxHeight: filteredAll.length > 5 ? "320px" : undefined }}
                        >
                            {filteredAll.map((c, idx) => {
                                const avatarStyle = getAvatarStyle(idx);
                                return (
                                    <div key={c.id ?? idx} className="flex items-center gap-3 py-3">
                                        <div
                                            className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0"
                                            style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                        >
                                            {getInitials(c.fullName ?? "?")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {c.fullName ?? "—"}
                                            </p>
                                            {c.niche && (
                                                <p className="text-xs text-gray-400 truncate">{c.niche}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
                                            <Calendar size={12} />
                                            {formatDate(c.createdAt ?? c.indexedAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        {lq ? `${filteredAll.length} de ${allCandidates.length}` : filteredAll.length} candidato{filteredAll.length !== 1 ? "s" : ""}
                    </p>
                </section>

                {/* CALCULATING OVERLAY */}
                {isRecalculating && (
                    <div className="rounded-2xl p-12 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: "#2d2d2d" }}>
                        <div className="text-center space-y-1">
                            <p className="text-white text-base font-medium">Calculando MatchScores (IA)</p>
                            <p className="text-gray-400 text-sm">
                                Evaluando {allCandidates.length} candidato{allCandidates.length !== 1 ? "s" : ""} para {vacancy?.title}…
                            </p>
                        </div>
                        <div className="w-9 h-9 border-4 border-[#447ECA] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* SECTION 2: EVALUATED CANDIDATES (with match scores) */}
                {!isRecalculating && (
                    <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <p className="text-sm font-bold text-gray-700">
                                    Evaluaciones:{" "}
                                    <span className="text-[#447ECA]">
                                        {filteredEvaluated.length} mejores candidatos
                                    </span>
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {vacancy?.title} · {filteredEvaluated.length} candidatos evaluados
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg shrink-0">
                                <BarChart2 size={12} />
                                {vacancy?.position?.role ?? "—"}
                            </span>
                        </div>

                        {filteredEvaluated.length > 0 && (
                            <div className="flex items-start gap-3 bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-3 my-4">
                                <Sparkles className="text-[#447ECA] shrink-0 mt-0.5" size={15} strokeWidth={2.5} />
                                <p className="text-xs text-[#447ECA] font-medium">
                                    Evaluación IA completada. Los candidatos han sido evaluados y clasificados por compatibilidad
                                    con los requisitos de la posición. Usa "Recalcular" para actualizar si subes nuevos CVs.
                                </p>
                            </div>
                        )}

                        {filteredEvaluated.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">
                                No hay candidatos evaluados aún. Usa el botón{" "}
                                <span className="font-bold text-gray-600">Recalcular MatchScore (IA)</span> para iniciar.
                            </p>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filteredEvaluated.map((m, idx) => {
                                    const person = m.candidate;
                                    const score = m.matchScore ?? 0;
                                    const scoreColor = getScoreColor(score);
                                    const lightText = score < 50;
                                    const avatarStyle = getAvatarStyle(idx);
                                    const candidateStatus = candidateStatuses.get(m.id) ?? "NO_CONTRATADO";

                                    return (
                                        <div key={m.id ?? idx} className="flex items-center gap-3 py-3.5">
                                            {/* Rank */}
                                            <span className="text-gray-300 text-xs w-4 text-center shrink-0 select-none tabular-nums">
                                                {idx + 1}
                                            </span>

                                            {/* Avatar */}
                                            <div
                                                className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0"
                                                style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                            >
                                                {getInitials(person?.fullName ?? "?")}
                                            </div>

                                            {/* Candidate info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {person?.fullName ?? "—"}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">{person?.email ?? ""}</p>
                                                {person?.niche && (
                                                    <span
                                                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                        style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
                                                    >
                                                        {person.niche}
                                                    </span>
                                                )}
                                                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    Subido: {formatDate(person?.createdAt ?? person?.indexedAt)}
                                                </p>
                                            </div>

                                            {/* Status selector */}
                                            <select
                                                value={candidateStatus}
                                                onChange={e => handleUpdateStatus(m.id, e.target.value)}
                                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer shrink-0 ${getStatusStyle(candidateStatus)}`}
                                            >
                                                <option value="NO_CONTRATADO">No Contratado</option>
                                                <option value="CONTACTADO">Contactar</option>
                                                <option value="CONTRATADO">Contratado</option>
                                            </select>

                                            {/* Match score badge */}
                                            <div
                                                className="w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 shadow-sm"
                                                style={{ backgroundColor: scoreColor }}
                                            >
                                                <span className={`text-sm leading-none font-bold ${lightText ? "text-white" : "text-gray-800"}`}>
                                                    {score}%
                                                </span>
                                                <span className={`text-[9px] mt-0.5 ${lightText ? "text-white/70" : "text-gray-600"}`}>
                                                    Match
                                                </span>
                                            </div>

                                            {/* View profile */}
                                            <button
                                                onClick={() => { setSelectedMatch(m); setIsModalOpen(true); }}
                                                className="text-gray-400 hover:text-[#447ECA] transition-colors shrink-0"
                                                title="Ver perfil"
                                            >
                                                <Eye size={17} />
                                            </button>

                                            {/* Download CV */}
                                            {person?.resumeUrl ? (
                                                <a
                                                    href={person.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-[#447ECA] transition-colors shrink-0"
                                                    title="Descargar CV"
                                                >
                                                    <Download size={17} />
                                                </a>
                                            ) : (
                                                <span className="w-[17px] shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
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

export default AdvancedResults;
