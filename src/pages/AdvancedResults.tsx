import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, Calendar, Eye, Upload, Search, Download } from "lucide-react";

import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";
import { vacanciesApi } from "../services/api/vacancies.api";
import { departmentsApi } from "../services/api/departments.api";
import { Candidate, MatchResult, UploadResult, Vacancy } from "../types/api.types";

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
    switch (status?.toUpperCase()) {
        case "CONTRATADO": return "bg-green-50 border-green-200 text-green-700";
        case "CONTACTADO": return "bg-blue-50 border-blue-200 text-blue-700";
        default: return "bg-gray-50 border-gray-200 text-gray-600";
    }
};

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
    const [candidateStatuses, setCandidateStatuses] = useState<Map<number, string>>(new Map());
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const allCandidates: Candidate[] = localCandidates;

    const loadData = useCallback(async (vacancyId: string) => {
        const [results, vac] = await Promise.all([
            vacanciesApi.getResults(vacancyId),
            vacanciesApi.getById(vacancyId).catch(() => null),
        ]);
        setEvaluatedCandidates(Array.isArray(results) ? results : []);
        setVacancy(vac);
        // If the backend returns candidates on getById, use them as the source of truth for Section 1
        if (vac?.candidates && vac.candidates.length > 0) {
            setLocalCandidates(vac.candidates);
        }
        return vac;
    }, []);

    useEffect(() => {
        let cancelled = false;
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

    // Upload CVs without triggering evaluation — evaluation is explicit via Recalcular button.
    // Candidates are extracted directly from the upload response so they appear immediately
    // without relying on getById returning the candidates array.
    const handleFilesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !id) return;
        setError(null);
        setIsUploading(true);
        try {
            const results: UploadResult[] = await vacanciesApi.uploadCVs(id, Array.from(files));
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
                const reasons = failed.map(r => r.message ?? r.error ?? "Error desconocido").join(" | ");
                setError(
                    uploaded.length > 0
                        ? `${uploaded.length} CV(s) procesado(s). ${failed.length} falló: ${reasons}`
                        : `No se pudo procesar el CV: ${reasons}`
                );
            }
            setShowDropzone(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al subir los CVs.");
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

    const handleUpdateStatus = (candidateId: number, newStatus: string) => {
        setCandidateStatuses(prev => new Map(prev).set(candidateId, newStatus));
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
                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${isClosed ? "bg-slate-200 text-slate-600" : "bg-[#DCFCE7] text-[#16A34A]"}`}>
                                {isClosed ? "Cerrada" : "Abierta"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-0.5 flex items-center gap-1.5 justify-center">
                            {vacancy ? formatVacancyCode(vacancy.id) : "—"}
                            <span className="opacity-40">•</span>
                            <Layers size={11} className="opacity-50" />
                            {departmentName}
                        </p>
                    </div>

                    <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating || isClosed}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#447ECA] text-white rounded-xl font-bold shadow-sm hover:bg-[#3669ab] transition-all text-xs shrink-0 disabled:opacity-40"
                    >
                        <Sparkles size={14} />
                        {isRecalculating ? "Recalculando..." : "Recalcular MatchScore (IA)"}
                    </button>
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
                            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#447ECA] transition-colors"
                        />
                    </div>

                    {/* Dropzone */}
                    {showDropzone && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={e => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleFilesUpload(e.dataTransfer.files);
                            }}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-3 flex flex-col items-center gap-2 transition-all ${isDragging
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
                    )}

                    {/* Candidate rows */}
                    {filteredAll.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            {allCandidates.length === 0
                                ? "Aún no hay candidatos. Sube CVs para comenzar."
                                : "Ningún candidato coincide con la búsqueda."}
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredAll.map((c, idx) => (
                                <div key={c.id ?? idx} className="flex items-center gap-3 py-3">
                                    <div className="w-9 h-9 rounded-full bg-[#DCF9FF] text-[#447ECA] font-bold flex items-center justify-center text-xs shrink-0">
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
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        {filteredAll.length} candidato{filteredAll.length !== 1 ? "s" : ""}
                    </p>
                </section>

                {/* SECTION 2: EVALUATED CANDIDATES (with match scores) */}
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
                            <Upload size={12} />
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
                                const candidateStatus = candidateStatuses.get(m.candidateId) ?? "NO_CONTRATADO";

                                return (
                                    <div key={m.id ?? idx} className="flex items-center gap-3 py-3.5">
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-[#DCF9FF] text-[#447ECA] font-bold flex items-center justify-center text-xs shrink-0">
                                            {getInitials(person?.fullName ?? "?")}
                                        </div>

                                        {/* Candidate info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {person?.fullName ?? "—"}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{person?.email ?? ""}</p>
                                            {person?.niche && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-[#EAF7FF] text-[#447ECA] rounded-full text-[10px] font-bold">
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
                                            onChange={e => handleUpdateStatus(m.candidateId, e.target.value)}
                                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer shrink-0 ${getStatusStyle(candidateStatus)}`}
                                        >
                                            <option value="NO_CONTRATADO">No Contratado</option>
                                            <option value="CONTACTADO">Contactar</option>
                                            <option value="CONTRATADO">Contratado</option>
                                        </select>

                                        {/* Match score badge */}
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                                            style={{
                                                backgroundColor: `${scoreColor}22`,
                                                color: scoreColor,
                                                border: `2px solid ${scoreColor}`,
                                            }}
                                        >
                                            {score}%
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
