import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, Calendar, Eye, Upload, Search } from "lucide-react";

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

    const currentColor = getColor(score);

    return (
        <div className="relative flex items-center justify-center w-[100px] h-[100px]">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle stroke="#F3F4F6" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke={currentColor}
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
                <span className="text-xl font-bold leading-none" style={{ color: currentColor }}>
                    {score}%
                </span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">Match</span>
            </div>
        </div>
    );
};

const AdvancedResults: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados de Datos
    const [candidates, setCandidates] = useState<MatchResult[]>([]);
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [departmentName, setDepartmentName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Estados de UI y Cargas
    const [loading, setLoading] = useState<boolean>(true);
    const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
    const [hiring, setHiring] = useState<boolean>(false);
    const [showDropzone, setShowDropzone] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Modales y Errores
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

    // Lógica para procesar los archivos cargados (Manual o Drag & Drop)
    const handleFilesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !id) return;

        setError(null);
        setLoading(true);
        try {
            const fileArray = Array.from(files);

            // Enviamos los archivos al endpoint
            await vacanciesApi.uploadCVs(id, fileArray);

            // Ejecutamos la evaluación IA inmediatamente
            await vacanciesApi.evaluateCandidates(id);

            // Recargamos los candidatos desde el servidor para actualizar la lista de abajo
            await loadResults(id);

            // Ocultamos la dropzone automáticamente para que se vea la lista limpia
            setShowDropzone(false);
        } catch (err: any) {
            console.error("Error al subir los CVs:", err);
            setError(err?.message || "Ocurrió un error al procesar y evaluar los archivos CV subidos.");
        } finally {
            setLoading(false);
        }
    };

    // Handlers para eventos de arrastre (Drag and Drop)
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFilesUpload(e.dataTransfer.files);
        }
    };

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
        const confirmed = window.confirm("Contratar cerrará la vacante. ¿Deseas continuar?");
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

    const handleUpdateCandidateStatus = async (matchId: string | number, newStatus: string) => {
        // Si tu backend aún no tiene el endpoint listo en vacanciesApi,
        // actualizamos el estado en el frontend para mantener la UI interactiva.
        setCandidates((prevCandidates) =>
            prevCandidates.map((c) =>
                String(c.id) === String(matchId) ? { ...c, status: newStatus } : c
            )
        );

        // NOTA: Cuando tu backend tenga el endpoint de candidatos listo, 
        // podrás descomentar y llamar a la API correspondiente aquí.
    };

    const handleViewCandidate = (match: MatchResult) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    const getStatusSelectStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case "CONTRATADO": return "bg-green-50 border-green-200 text-green-700 focus:ring-green-500";
            case "CONTACTADO": return "bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500";
            default: return "bg-gray-50 border-gray-200 text-gray-700 focus:ring-gray-500";
        }
    };

    // Filtrado en tiempo real mediante barra de búsqueda
    const filteredCandidates = candidates.filter(c => {
        const name = c.candidate?.fullName?.toLowerCase() || "";
        const role = vacancy?.position?.role?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || role.includes(query);
    });

    if (loading && candidates.length === 0) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <p className="text-gray-500 font-medium animate-pulse">Cargando módulo de análisis...</p>
            </div>
        );
    }

    const isClosed = vacancy?.status === "CLOSED";

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-[1400px]">

                {/* ENCABEZADO PRINCIPAL */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <button
                        onClick={() => navigate("/vacancies")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                        <ArrowLeft size={18} /> Volver a Vacantes
                    </button>

                    <div className="text-center flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                {vacancy?.title ?? "Diseñador UX/UI Senior"}
                            </h1>
                            <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${isClosed ? "bg-slate-200 text-slate-600" : "bg-[#DCFCE7] text-[#16A34A]"}`}>
                                {isClosed ? "Cerrada" : "Abierta"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium mt-1 flex items-center gap-2 justify-center">
                            {vacancy ? formatVacancyCode(vacancy.id) : "Vac-001"}
                            <span className="opacity-40">•</span>
                            <Layers size={12} className="opacity-50" /> {departmentName || "Tecnología / IT"}
                        </p>
                    </div>

                    <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating || isClosed}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#447ECA] text-white rounded-xl font-bold shadow-sm hover:bg-[#3669ab] transition-all text-sm disabled:opacity-40"
                    >
                        <Sparkles size={16} />
                        {isRecalculating ? "Recalculando..." : "Recalcular MatchScore (IA)"}
                    </button>
                </header>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium mb-6">
                        {error}
                    </div>
                )}

                {/* COMPONENTE 1: RESUMEN DE LA VACANTE (Imagen 1) */}
                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Posición</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{vacancy?.position?.role || "UX & UI Designer Senior"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Departamento</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{departmentName || "Tecnología / IT"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cupos</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">2</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fechas</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">10/03/2026 → 10/04/2026</p>
                    </div>
                </section>

                {/* COMPONENTE 2: CONTROL DE SUBIDA Y BUSCADOR */}
                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">Candidatos de esta Vacante</span>
                            <span className="bg-[#E0F2FE] text-[#0369A1] text-xs font-bold px-2 py-0.5 rounded-full">
                                {filteredCandidates.length}
                            </span>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleFilesUpload(e.target.files)}
                        />
                        <button
                            onClick={() => setShowDropzone(!showDropzone)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all ${showDropzone
                                    ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <Upload size={14} /> Subir CVs
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar candidato por nombre o rol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#447ECA] transition-colors"
                        />
                    </div>

                    {/* DROPZONE: Se muestra aquí en el medio si showDropzone es true, sin alterar las tarjetas */}
                    {showDropzone && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${isDragging
                                    ? "border-[#447ECA] bg-[#F0F7FF]"
                                    : "border-gray-200 bg-[#F8FAFC] hover:bg-[#F1F5F9]"
                                }`}
                        >
                            <Upload className="text-gray-300" size={28} />
                            <p className="text-sm font-medium text-gray-600">
                                Arrastra CVs aquí o <span className="text-[#447ECA] font-bold">haz clic para seleccionar</span>
                            </p>
                            <p className="text-[11px] text-gray-400">
                                PDF, DOC, DOCX — múltiples archivos permitidos
                            </p>
                        </div>
                    )}
                </section>

                {/* MENSAJE DE CONTEXTO DE LA IA */}
                <div className="bg-[#F0F7FF] border border-[#D1E9FF] rounded-xl p-4 flex items-center gap-3 mb-6">
                    <Sparkles className="text-[#447ECA]" size={20} strokeWidth={2.5} />
                    <p className="text-sm text-[#447ECA] font-medium">
                        Mostrando los candidatos con mayor compatibilidad con los requisitos de la posición.
                    </p>
                </div>

                <p className="text-gray-500 font-medium text-sm mb-6">
                    <span className="text-[#447ECA] font-bold">{filteredCandidates.length} candidatos</span> evaluados
                </p>

                {/* COMPONENTE 3: VISTA DE TARJETA DE CANDIDATOS (Imagen 3) */}
                {filteredCandidates.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-400 border border-gray-100">
                        Ningún candidato coincide con los criterios de búsqueda o carga.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((c, idx) => {
                            const person = c.candidate;
                            const displayName = person?.fullName ?? "Candidato";
                            const initials = displayName.split(" ").map((n) => n[0]).join("").substring(0, 2);

                            // Evitamos el error de propiedad inexistente usando un casteo seguro a 'any'
                            const currentStatus = (c as any).status || "NO_CONTRATADO";

                            return (
                                <div
                                    key={c.id || idx}
                                    className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col relative hover:shadow-md transition-shadow"
                                >
                                    {/* Indicador de posición en el ranking */}
                                    <div className="absolute top-6 right-6 text-gray-300 font-bold text-sm">
                                        #{idx + 1}
                                    </div>

                                    {/* Encabezado del Candidato (Avatar e Información básica) */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-[#DCF9FF] text-[#447ECA] font-bold flex items-center justify-center text-sm shrink-0">
                                            {initials || "?"}
                                        </div>
                                        <div className="flex flex-col truncate pr-8">
                                            <h3 className="text-base font-medium text-gray-900 truncate">{displayName}</h3>
                                            <p className="text-[13px] text-gray-400 truncate">{person?.email ?? ""}</p>
                                        </div>
                                    </div>

                                    {/* Gráfico de Progreso Circular del MatchScore */}
                                    <div className="flex justify-center mb-6">
                                        <CircularProgress score={c.matchScore ?? 0} />
                                    </div>

                                    {/* Selector de Estado del Candidato */}
                                    <div className="mb-6">
                                        <select
                                            value={currentStatus}
                                            // Pasamos c.id directamente adaptado a la firma del handler actualizado
                                            onChange={(e) => handleUpdateCandidateStatus(c.id, e.target.value)}
                                            className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all cursor-pointer ${getStatusSelectStyles(currentStatus)}`}
                                        >
                                            <option value="NO_CONTRATADO">No Contratado</option>
                                            <option value="CONTACTADO">Contactar</option>
                                            <option value="CONTRATADO">Contratado</option>
                                        </select>
                                    </div>

                                    {/* Detalles adicionales y Rol de la Vacante */}
                                    <div className="flex flex-col gap-3 mb-6 mt-auto">
                                        <span className="inline-flex w-fit px-3 py-1 bg-[#EAF7FF] text-[#447ECA] rounded-full text-[11px] font-bold">
                                            {vacancy?.position?.role || "UX & UI Designer Senior"}
                                        </span>
                                        <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                                            <Calendar size={14} /> CV subido para esta vacante
                                        </div>
                                    </div>

                                    {/* Acciones de la Tarjeta (Contratar / Ver Perfil) */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <button
                                            onClick={handleHire}
                                            disabled={hiring || isClosed}
                                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-colors disabled:opacity-40"
                                        >
                                            {hiring ? "Contratando..." : "Contratar"}
                                        </button>

                                        <button
                                            onClick={() => handleViewCandidate(c)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#447ECA] text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#3669ab] transition-all"
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
