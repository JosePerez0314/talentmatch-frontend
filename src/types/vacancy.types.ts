export type VacancyStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'CONTACTING';

export interface Vacancy {
    id: string | number;
    title: string;
    positionId: number;
    openDate: string;
    closeDate: string;
    status: VacancyStatus;
    // Fallback opcional por si el backend llega a incluir el objeto anidado
    position?: {
        id: number;
        role: string;
    };
}