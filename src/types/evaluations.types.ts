export interface EvaluationVacancy {
    id: string;
    title: string;
    roleDescription: string;
    vacancyCode: string;
    department: string;
    candidatesCount: number;
    status: "Activa" | "Cerrada";
}