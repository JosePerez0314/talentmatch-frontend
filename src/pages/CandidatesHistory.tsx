import React, { useEffect, useMemo, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { candidateService } from "../services/api/candidates.api";
import { Candidate } from "../types/api.types";

const getDisplayName = (c: Candidate): string => {
    if (c.fullName) return c.fullName;
    const parts = [c.firstName, c.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : c.email;
};

const getInitials = (name: string): string =>
    name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const CandidatesHistory: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setIsLoading(true);
                const data = await candidateService.getAll();
                if (cancelled) return;
                setCandidates(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando candidatos:", err);
                if (!cancelled) setError("No pudimos cargar la lista de candidatos.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalCandidates = useMemo(() => candidates.length, [candidates]);

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-600">
            <div className="max-w-6xl mx-auto space-y-6">

                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Candidatos</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {totalCandidates} {totalCandidates === 1 ? "candidato" : "candidatos"}
                    </p>
                </div>

                {isLoading && (
                    <p className="text-sm text-slate-400 font-medium animate-pulse">Cargando candidatos...</p>
                )}

                {error && !isLoading && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                )}

                {!isLoading && !error && candidates.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center text-sm text-slate-400 border border-slate-100">
                        Aún no tienes candidatos cargados.
                    </div>
                )}

                {!isLoading && !error && candidates.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                        {candidates.map((candidate) => {
                            const name = getDisplayName(candidate);
                            const isHired = candidate.status === "CONTRATADO";
                            return (
                                <div
                                    key={candidate.id}
                                    className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors"
                                >
                                    <div className="md:col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-xs tracking-wider">
                                            {getInitials(name) || <FiUsers />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-slate-800 truncate">{name}</h3>
                                            <p className="text-xs text-slate-400 font-medium truncate">{candidate.email}</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 text-xs font-medium text-slate-400 truncate">
                                        {candidate.niche || "—"}
                                    </div>

                                    <div className="md:col-span-2 text-xs text-slate-400">
                                        {formatDate(candidate.createdAt)}
                                    </div>

                                    <div className="md:col-span-1 md:justify-self-end">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                                isHired
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {isHired && <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block" />}
                                            {candidate.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidatesHistory;
