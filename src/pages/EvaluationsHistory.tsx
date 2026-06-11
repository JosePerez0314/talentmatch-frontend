import React from "react";
import EvaluationCard from "../components/EvaluationCard";

// Declaramos la estructura aquí mismo para solucionar las líneas rojas de TypeScript
interface EvaluationVacancy {
    id: string;
    title: string;
    roleDescription: string;
    vacancyCode: string;
    department: string;
    candidatesCount: number;
    status: "Activa" | "Cerrada";
}

// Datos de prueba idénticos a la captura de pantalla de Figma
const MOCK_EVALUATIONS: EvaluationVacancy[] = [
    {
        id: "ev1",
        title: "Diseñador UX/UI Senior",
        roleDescription: "UX & UI Designer Senior",
        vacancyCode: "Vac-001",
        department: "Tecnología / IT",
        candidatesCount: 3,
        status: "Activa"
    },
    {
        id: "ev2",
        title: "Supervisor RRHH Sr",
        roleDescription: "Supervisor de Recursos Humanos",
        vacancyCode: "Vac-003",
        department: "Recursos Humanos",
        candidatesCount: 1,
        status: "Activa"
    },
    {
        id: "ev3",
        title: "Supervisor Ventas Zona Norte",
        roleDescription: "Supervisor de Ventas",
        vacancyCode: "Vac-004",
        department: "Ventas",
        candidatesCount: 1,
        status: "Activa"
    },
    {
        id: "ev4",
        title: "Backend Developer Python",
        roleDescription: "Desarrollador Backend Jr",
        vacancyCode: "Vac-006",
        department: "Tecnología / IT",
        candidatesCount: 2,
        status: "Activa"
    }
];

const EvaluationsHistory: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f0f0f5] text-slate-600 p-8 w-full">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Cabecera de la Vista */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Evaluaciones
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Selecciona una vacante activa para calcular el ranking de candidatos.
                    </p>
                </div>

                {/* Listado de Tarjetas de Evaluación usando espaciado vertical homogéneo */}
                <div className="space-y-4">
                    {MOCK_EVALUATIONS.map((vacancy) => (
                        <EvaluationCard key={vacancy.id} vacancy={vacancy} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default EvaluationsHistory;