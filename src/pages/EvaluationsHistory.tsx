import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EvaluationCard from "../components/EvaluationCard";
import { EvaluationVacancy } from "../types/evaluations.types";
import { vacanciesApi } from "../services/api/vacancies.api";
import { departmentsApi } from "../services/api/departments.api";
import { Vacancy } from "../types/api.types";
import { Department } from "../types/department.types";
import { ApiError } from "../services/api/apiClient";

const formatVacancyCode = (id: number): string => `Vac-${String(id).padStart(3, "0")}`;

const toEvaluationVacancy = (
    vacancy: Vacancy,
    departmentsById: Map<string, Department>,
): EvaluationVacancy => {
    const department =
        vacancy.position?.department?.name ??
        departmentsById.get(String(vacancy.departmentId))?.name ??
        "Sin departamento";

    return {
        id: String(vacancy.id),
        title: vacancy.title,
        roleDescription: vacancy.position?.role ?? "",
        vacancyCode: formatVacancyCode(vacancy.id),
        department,
        candidatesCount: vacancy._count?.candidates ?? 0,
        status: vacancy.status === "CLOSED" ? "Cerrada" : "Activa",
    };
};

const EvaluationsHistory: React.FC = () => {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [calculatingId, setCalculatingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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
            } catch (err) {
                console.error("Error cargando evaluaciones:", err);
                if (!cancelled) setLoadError("No pudimos cargar las vacantes. Intenta de nuevo más tarde.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const departmentsById = useMemo(() => {
        const map = new Map<string, Department>();
        departments.forEach((d) => map.set(String(d.id), d));
        return map;
    }, [departments]);

    const evaluations = useMemo(
        () => vacancies.map((v) => toEvaluationVacancy(v, departmentsById)),
        [vacancies, departmentsById],
    );

    const handleCalculate = async (vacancyId: string) => {
        setActionError(null);
        setCalculatingId(vacancyId);
        try {
            await vacanciesApi.evaluateCandidates(vacancyId);
            navigate(`/resultados/${vacancyId}`);
        } catch (err) {
            console.error("Error al evaluar:", err);
            if (err instanceof ApiError && err.status === 400) {
                setActionError("No hay candidatos pendientes de evaluar en esta vacante.");
            } else {
                setActionError("No se pudo iniciar la evaluación. Intenta de nuevo.");
            }
        } finally {
            setCalculatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f0f5] text-slate-600 p-8 w-full">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Evaluaciones
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        Selecciona una vacante activa para calcular el ranking de candidatos.
                    </p>
                </div>

                {actionError && (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium">
                        {actionError}
                    </div>
                )}

                {isLoading && (
                    <p className="text-sm text-slate-400 font-medium animate-pulse">Cargando vacantes...</p>
                )}

                {loadError && !isLoading && (
                    <p className="text-sm text-red-500 font-medium">{loadError}</p>
                )}

                {!isLoading && !loadError && evaluations.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center text-sm text-slate-400 border border-slate-100">
                        Aún no tienes vacantes creadas.
                    </div>
                )}

                <div className="space-y-4">
                    {evaluations.map((vacancy) => (
                        <EvaluationCard
                            key={vacancy.id}
                            vacancy={vacancy}
                            onCalculate={handleCalculate}
                            isCalculating={calculatingId === vacancy.id}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default EvaluationsHistory;
