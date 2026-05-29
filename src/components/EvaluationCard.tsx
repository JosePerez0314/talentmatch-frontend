import React from "react";
import { FiUsers, FiCpu, FiLayers, FiCheckCircle } from "react-icons/fi";

// Definimos la estructura aquí mismo para evitar el archivo externo
interface EvaluationVacancy {
    id: string;
    title: string;
    roleDescription: string;
    vacancyCode: string;
    department: string;
    candidatesCount: number;
    status: "Activa" | "Cerrada";
}

interface EvaluationCardProps {
    vacancy: EvaluationVacancy;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ vacancy }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

                {/* 1. Icono de Personas */}
                <div className="sm:col-span-1 flex justify-start sm:justify-center">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                        <FiUsers className="text-xl" />
                    </div>
                </div>

                {/* 2. Información Central */}
                <div className="sm:col-span-8 space-y-1">
                    <h3 className="text-base font-semibold text-slate-800 tracking-tight">
                        {vacancy.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 font-medium">
                        <span>{vacancy.roleDescription}</span>
                        <span className="text-slate-300">•</span>
                        <span>{vacancy.vacancyCode}</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-blue-500 font-semibold">
                            <FiLayers className="text-[11px]" />
                            <span>{vacancy.department}</span>
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-emerald-600 mt-1">
                        {vacancy.candidatesCount} {vacancy.candidatesCount === 1 ? "candidato subido" : "candidatos subidos"}
                    </p>
                </div>

                {/* 3. Badge de Estado */}
                <div className="sm:col-span-1 sm:justify-self-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <FiCheckCircle className="text-xs" />
                        {vacancy.status}
                    </span>
                </div>

                {/* 4. Botón de Acción "Calcular" */}
                <div className="sm:col-span-2 justify-self-start sm:justify-self-end w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#447ECA] hover:bg-[#356BB0] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors duration-150">
                        <FiCpu className="text-sm" />
                        Calcular
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EvaluationCard;