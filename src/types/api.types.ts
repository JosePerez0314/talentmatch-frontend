import { Department } from "./department.types";

// ENUMS
export type UserRole = 'ADMIN' | 'USER';
export type EducationLevel = 'NONE' | 'HIGH_SCHOOL' | 'BACHELOR' | 'TECHNICAL' | 'UNIVERSITY' | 'MASTER' | 'DOCTORATE';
export type VacancyStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type CandidateStatus = 'DISPONIBLE' | 'CONTRATADO';

// INTERFACES DE ENTIDADES

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface Position {
    id: number;
    departmentId: number; 
    department?: Department;
    role: string;
    yearsOfExperience: number;
    description: string;
    technicalSkills: string[];
    optionalTechnicalSkills: string[];
    softSkills: string[];
    languages: string[];
    educationLevel: EducationLevel | string;
    educationArea?: string;
    isDeleted?: boolean; 
    createdAt?: string;
}

export interface Vacancy {
    id: number;
    departmentId: number;
    positionId: number;
    position?: Position;
    title: string;
    availableSlots: number;
    startDate: string;
    endDate: string;
    status: VacancyStatus;
    isDeleted: boolean; 
    createdAt: string;
}

export interface Candidate {
    id: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    skills?: string[];
    niche?: string; 
    status: CandidateStatus;
    indexedAt?: string; 
    createdAt?: string;
}

export interface MatchResult {
    id: number;
    vacancyId: number;
    candidateId: number;
    candidate?: Candidate;
    matchScore: number; 
    evaluatedAt?: string; 
}

// INTERFACES DE RESPUESTA HTTP

// Soporte para errores
export interface ApiErrorDetail {
    field: string;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
    details?: ApiErrorDetail[];
}

// Per-file result of POST /vacancies/:id/upload (each PDF processed independently)
export interface UploadResult {
    success: boolean;
    data?: Candidate;
    message?: string;
    error?: string;
}

// Auth contracts live in ./auth.types.ts