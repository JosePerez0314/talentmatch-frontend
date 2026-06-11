export interface HistoryCandidate {
    id: string;
    name: string;
    email: string;
    appliedDate: string;
    status: "Disponible" | "Contratado";
    avatarUrl?: string;
}

export interface VacancyGroup {
    id: string;
    title: string;
    candidatesCount: number;
    candidates: HistoryCandidate[];
}