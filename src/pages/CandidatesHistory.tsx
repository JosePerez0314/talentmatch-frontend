import React, { useState, useMemo } from "react";
import { FiChevronDown, FiChevronUp, FiMoreVertical, FiCheckCircle, FiTrash2, FiExternalLink, FiUsers } from "react-icons/fi";
import { VacancyGroup, HistoryCandidate } from "../types/candidates-history.types";

const MOCK_VACANCIES: VacancyGroup[] = [
    {
        id: "v1",
        title: "Diseñador UX/UI Senior",
        candidatesCount: 3,
        candidates: [
            { id: "c1", name: "Ana García", email: "ana.garcia@gmail.com", appliedDate: "10/03/2026", status: "Disponible" },
            { id: "c2", name: "María López", email: "maria.lopez@gmail.com", appliedDate: "10/03/2026", status: "Disponible" },
            { id: "c3", name: "Diego Vargas", email: "diego.vargas@gmail.com", appliedDate: "12/03/2026", status: "Contratado" },
        ],
    },
    {
        id: "v2",
        title: "Dev Backend Expansion",
        candidatesCount: 0,
        candidates: [],
    },
];

const CandidatesHistory: React.FC = () => {
    const [expandedVacancies, setExpandedVacancies] = useState<Record<string, boolean>>({ v1: true });
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleVacancy = (id: string) => {
        setExpandedVacancies((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDropdown = (e: React.MouseEvent<HTMLElement>, candidateId: string) => {
        e.stopPropagation();
        setActiveDropdown((prev) => (prev === candidateId ? null : candidateId));
    };

    const { totalVacancies, totalCandidates } = useMemo(() => {
        return {
            totalVacancies: MOCK_VACANCIES.length,
            totalCandidates: MOCK_VACANCIES.reduce((acc, curr) => acc + curr.candidatesCount, 0),
        };
    }, []);

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-600">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Cabecera */}
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Candidatos</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {totalCandidates} candidatos · {totalVacancies} vacantes
                    </p>
                </div>

                {/* Listado Principal de Vacantes */}
                <div className="space-y-4">
                    {MOCK_VACANCIES.map((vacancy) => {
                        const isExpanded = expandedVacancies[vacancy.id];

                        return (
                            <div key={vacancy.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                                {/* Cabecera del Acordeón */}
                                <div
                                    onClick={() => toggleVacancy(vacancy.id)}
                                    className="flex items-center justify-between p-5 hover:bg-slate-50/50 cursor-pointer transition-colors select-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                                            <FiUsers className="text-lg" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-slate-800">{vacancy.title}</h2>
                                            <p className="text-xs text-slate-400 font-medium">UX & UI Designer Senior · Tecnología / IT</p>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium ml-2">
                                            {vacancy.candidatesCount} candidatos
                                        </span>
                                    </div>

                                    {/* Botón externo corregido sin advertencias de accesibilidad ni de anidamiento */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                                e.stopPropagation();
                                                alert("Abriendo detalles de la vacante...");
                                            }}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-500 transition-colors cursor-pointer"
                                        >
                                            <FiExternalLink className="text-lg" />
                                        </div>
                                        {isExpanded ? <FiChevronUp className="text-xl text-slate-400" /> : <FiChevronDown className="text-xl text-slate-400" />}
                                    </div>
                                </div>

                                {/* Listado Desplegable de Candidatos (Perfectamente separado de la cabecera) */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 divide-y divide-slate-100 bg-white">
                                        {vacancy.candidates.length === 0 ? (
                                            <div className="p-8 text-center text-sm text-slate-400">
                                                No hay candidatos asignados a esta vacante.
                                            </div>
                                        ) : (
                                            vacancy.candidates.map((candidate) => (
                                                <div
                                                    key={candidate.id}
                                                    className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/30 transition-colors pl-16 relative"
                                                >
                                                    {/* Info del Candidato */}
                                                    <div className="col-span-4 flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-xs tracking-wider">
                                                            {candidate.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-slate-800">{candidate.name}</h3>
                                                            <p className="text-xs text-slate-400 font-medium">{candidate.email}</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">Subido: {candidate.appliedDate}</p>
                                                        </div>
                                                    </div>

                                                    {/* Cargo de Postulación */}
                                                    <div className="col-span-4 text-xs font-medium text-slate-400">
                                                        Frontend Developer
                                                    </div>

                                                    {/* Badge de Estado */}
                                                    <div className="col-span-3">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${candidate.status === "Contratado"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                                }`}
                                                        >
                                                            {candidate.status === "Contratado" && <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block" />}
                                                            {candidate.status}
                                                        </span>
                                                    </div>

                                                    {/* Menú de Acciones */}
                                                    <div className="col-span-1 justify-self-end relative">
                                                        <div
                                                            onClick={(e: React.MouseEvent<HTMLDivElement>) => toggleDropdown(e, candidate.id)}
                                                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                                                        >
                                                            <FiMoreVertical className="text-lg" />
                                                        </div>

                                                        {/* Dropdown Flotante */}
                                                        {activeDropdown === candidate.id && (
                                                            <DropdownMenu
                                                                candidate={candidate}
                                                                onClose={() => setActiveDropdown(null)}
                                                            />
                                                        )}
                                                    </div>

                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface DropdownProps {
    candidate: HistoryCandidate;
    onClose: () => void;
}

const DropdownMenu: React.FC<DropdownProps> = ({ candidate, onClose }) => {
    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 transition-all">
                <button
                    onClick={() => {
                        alert(`Marcado como contratado: ${candidate.name}`);
                        onClose();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                    <FiCheckCircle className="text-emerald-500 text-sm" />
                    Marcar como contratado
                </button>
                <button
                    onClick={() => {
                        alert(`Eliminado: ${candidate.name}`);
                        onClose();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                >
                    <FiTrash2 className="text-rose-500 text-sm" />
                    Eliminar candidato
                </button>
            </div>
        </>
    );
};

export default CandidatesHistory;