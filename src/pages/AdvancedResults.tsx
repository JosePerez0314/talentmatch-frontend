import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, Calendar, Eye } from "lucide-react";

import CandidateDetailsModal from "../components/modals/CandidateDetailsModal.jsx";
import { vacanciesApi } from "../services/api/vacancies.api";
import { departmentsApi } from "../services/api/departments.api";
import { MatchResult, Vacancy } from "../types/api.types";

const formatVacancyCode = (id: number): string => `Vac-${String(id).padStart(3, "0")}`;

interface CircularProgressProps {
    score: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ score }) => {
    const radius = 54;
    const stroke = 7;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s: number): string => {
        if (s >= 80) return "#00FA15";
        if (s >= 50) return "#F8C807";
        return "#EF5050";
    };

    return (
        <div className="relative flex items-center justify-center w-[100px] h-[100px]">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle stroke="#F3F4F6" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke={getColor(score)}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 1.5s ease-in-out" }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800 leading-none">{score}%</span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">Match</span>
            </div>
        </div>
    );
};

const AdvancedResults: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [candidates, setCandidates] = useState<MatchResult[]>([]);
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [departmentName, setDepartmentName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
    const [hiring, setHiring] = useState<boolean>(false);
    const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadResults = useCallback(async (vacancyId: string) => {
        const [results, vac] = await Promise.all([
            vacanciesApi.getResults(vacancyId),
            vacanciesApi.getById(vacancyId).catch(() => null),
        ]);
        setCandidates(Array.isArray(results) ? results : []);
        setVacancy(vac);
        return vac;
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const vac = await loadResults(id);
                if (cancelled) return;
                if (vac?.departmentId != null) {
                    try {
                        const depts = await departmentsApi.getAll();
                        if (cancelled) return;
                        setDepartmentName(
                            depts.find((d) => String(d.id) === String(vac.departmentId))?.name ?? "",
                        );
                    } catch (err) {
                        console.error("Error cargando departamentos:", err);
                    }
                }
            } catch (err) {
                console.error("Error cargando resultados:", err);
                if (!cancelled) setError("No pudimos cargar los resultados de esta vacante.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id, loadResults]);

    const handleRecalculate = async () => {
        if (!id) return;
        setError(null);
        setIsRecalculating(true);
        try {
            await vacanciesApi.evaluateCandidates(id);
            await loadResults(id);
        } catch (err) {
            console.error("Error recalculando:", err);
            setError("No se pudo recalcular el match score.");
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleHire = async () => {
        if (!id) return;
        const confirmed = window.confirm(
            "Contratar cerrará la vacante. ¿Deseas continuar?",
        );
        if (!confirmed) return;
        setHiring(true);
        try {
            const updated = await vacanciesApi.updateStatus(id, "CLOSED");
            setVacancy((prev) => (prev ? { ...prev, status: updated.status } : updated));
        } catch (err) {
            console.error("Error cerrando vacante:", err);
            setError("No se pudo cerrar la vacante.");
        } finally {
            setHiring(false);
        }
    };

    const handleViewCandidate = (match: MatchResult) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <p className="text-gray-500 font-medium animate-pulse">Cargando resultados...</p>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center max-w-md">
                    <h2 className="text-xl font-bold text-gray-900">Selecciona una vacante</h2>
                    <p className="text-gray-400 text-sm mt-2">Vuelve al historial y elige una vacante para ver el análisis avanzado.</p>
                    <button
                        onClick={() => navigate("/vacancy-history")}
                        className="mt-6 px-6 py-3 bg-[#447ECA] text-white rounded-xl font-bold text-sm hover:bg-[#3669ab] transition-all"
                    >
                        Ir al historial
                    </button>
                </div>
            </div>
        );
    }

    const isClosed = vacancy?.status === "CLOSED";

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10 animate-fade-in flex justify-center">
            <div className="w-full max-w-[1400px]">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                        <ArrowLeft size={18} /> Volver al historial
                    </button>

                    <div className="text-center flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-medium text-gray-900">
                                {vacancy?.title ?? "Vacante"}
                            </h1>
                            <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                                isClosed
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-[#DCFCE7] text-[#16A34A]"
                            }`}>
                                {isClosed ? "Cerrada" : "Activa"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-1.5 flex items-center gap-2 justify-center">
                            {vacancy ? formatVacancyCode(vacancy.id) : ""}
                            {departmentName && (
                                <>
                                    <Layers size={12} className="opacity-50" /> {departmentName}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleRecalculate}
                            disabled={isRecalculating || isClosed}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#447ECA] text-white rounded-xl font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Sparkles size={16} />
                            {isRecalculating ? "Recalculando..." : "Recalcular MatchScore"}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-4 flex items-center gap-3 mb-6">
                    <Sparkles className="text-[#447ECA]" size={20} strokeWidth={2.5} />
                    <p className="text-sm text-[#447ECA] font-medium">
                        Mostrando los candidatos con mayor compatibilidad con los requisitos de la posición.
                    </p>
                </div>

                <p className="text-gray-500 font-medium text-sm mb-6">
                    <span className="text-[#447ECA] font-bold">{candidates.length} candidatos</span> evaluados
                </p>

                {candidates.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center text-sm text-gray-400 border border-gray-100">
                        Aún no hay evaluaciones para esta vacante.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map((c, idx) => {
                            const person = c.candidate;
                            const displayName = person?.fullName
                                ?? [person?.firstName, person?.lastName].filter(Boolean).join(" ")
                                ?? "Candidato";
                            const initials = displayName.split(" ").map((n) => n[0]).filter(Boolean).join("").substring(0, 2);
                            return (
                                <div key={c.id ?? idx} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col relative group hover:shadow-md transition-shadow">

                                    <div className="absolute top-6 right-6 text-gray-300 font-bold text-sm">
                                        #{idx + 1}
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-full bg-[#DCF9FF] text-[#447ECA] font-bold flex items-center justify-center text-sm shrink-0">
                                            {initials || "?"}
                                        </div>
                                        <div className="flex flex-col truncate pr-8">
                                            <h3 className="text-base font-medium text-gray-900 truncate">{displayName}</h3>
                                            <p className="text-[13px] text-gray-400 truncate">{person?.email ?? ""}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mb-8">
                                        <CircularProgress score={c.matchScore ?? 0} />
                                    </div>

                                    <div className="flex flex-col gap-3 mb-8">
                                        {vacancy?.position?.role && (
                                            <span className="inline-flex w-fit px-3 py-1 bg-[#EAF7FF] text-[#447ECA] rounded-full text-[11px] font-bold">
                                                {vacancy.position.role}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                                            <Calendar size={14} /> CV subido para esta vacante
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                        <button
                                            onClick={handleHire}
                                            disabled={hiring || isClosed}
                                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {hiring ? "Contratando..." : "Contratar"}
                                        </button>

                                        <button
                                            onClick={() => handleViewCandidate(c)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#447ECA] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#3669ab] active:scale-95 transition-all"
                                        >
                                            <Eye size={16} /> Ver perfil
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
