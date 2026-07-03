export type VacancyStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface Vacancy {
    id: number;
    title: string;
    positionId: number;
    departmentId: number;
    availableSlots: number;
    startDate: string;
    endDate: string;
    status: VacancyStatus;
    isDeleted: boolean;
    createdAt: string;
    
    // Fallback relacional
    position?: {
        id: number;
        role: string;
    };
}