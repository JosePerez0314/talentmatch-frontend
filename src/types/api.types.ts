import { Department } from "./department.types";

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
    createdAt: string;
}

export interface Position {
    id: number;
    title: string;
    description: string;
    requirements?: string;
    departmentId: number;
    department?: Department;
    isDeleted: boolean; // Control de Soft Delete requerido
    createdAt: string;
}

export interface Vacancy {
    id: number;
    positionId: number;
    position?: Position;
    title: string;
    status: 'OPEN' | 'PAUSED' | 'CLOSED'; // Estados operativos según UI/UX
    location: string;
    salaryRange?: string;
    isDeleted: boolean; // Control de Soft Delete requerido
    createdAt: string;
    limitDate?: string;
}

export interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    skills: string[];
    niche: string; // Generado automáticamente por la IA ("Backend Engineer", etc.)
    status: 'AVAILABLE' | 'HIRED'; // Estado operativo inmutable para ahorro de tokens
    indexedAt: string; // Procedencia de datos (Frescura)
    createdAt: string;
}

// Representa el modelo relacional del Upsert con restricción compuesta
export interface MatchResult {
    id: number;
    vacancyId: number;
    candidateId: number;
    candidate?: Candidate;
    matchScore: number; // Lazy Evaluation: calculado Just-In-Time
    evaluatedAt: string; // Timestamp del Upsert
}

// Envoltorio genérico de Axios/Backend (Criterio de aceptación obligado)
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}