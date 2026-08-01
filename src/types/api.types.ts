import { Department } from "./department.types";

// ENUMS
export type UserRole = 'ADMIN' | 'USER';
export type EducationLevel = 'NONE' | 'HIGH_SCHOOL' | 'BACHELOR' | 'TECHNICAL' | 'UNIVERSITY' | 'MASTER' | 'DOCTORATE';
export type VacancyStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type CandidateStatus = 'DISPONIBLE' | 'CONTRATADO';
export type ApplicationStatus = 'PENDIENTE' | 'EN_PROCESO' | 'SELECCIONADO' | 'RECHAZADO';

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
    // GET /vacancies includes _count.candidates and the full candidates array (see api-documentation.md §4)
    _count?: { candidates: number };
    candidates?: Candidate[];
}

export interface Candidate {
    id: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
    phone?: string;
    fileUrl?: string;      // CV URL returned by GET /vacancies/:id/results
    resumeUrl?: string;    // legacy field kept for backward compat
    skills?: string[];
    niche?: string;
    status?: CandidateStatus;
    indexedAt?: string;
    createdAt?: string;
    applications?: Application[];
}

// Structured candidate data extracted by the AI evaluation engine.
// The API returns this as a serialized JSON string inside MatchResult.normalizedCandidate.
// Parse with JSON.parse() before use.
export interface NormalizedCandidateAiAnalysis {
    rawTextSummary?: string;
    redFlags?: string;
    projectHighlights?: string[];
}

export interface NormalizedCandidate {
    fullName?: string;
    email?: string;
    role?: string;
    yearsOfExperience?: number;
    yearsExperience?: number;
    technicalSkills?: string[];
    optionalTechnicalSkills?: string[];
    softSkills?: string[];
    description?: string;
    educationLevel?: string;
    educationArea?: string;
    languages?: string[];
    aiAnalysis?: NormalizedCandidateAiAnalysis;
}

export interface MatchResult {
    id: number;
    vacancyId?: number;
    candidateId?: number;
    candidate?: Candidate;
    matchScore: number;
    evaluatedAt?: string;
    createdAt?: string;
    // Top-level AI fields returned directly on the result object
    summary?: string;
    redFlags?: string;
    // Per-category scores — present only when the backend ran the full AI evaluation
    hardSkillsScore?: number;
    experienceScore?: number;
    roleScore?: number;
    languagesScore?: number;
    educationScore?: number;
    softSkillsScore?: number;
    // matchReasoning kept for backward compat with older responses
    matchReasoning?: string;
    // Serialized JSON string — must be JSON.parse()'d before use
    normalizedCandidate?: string;
}

export interface Application {
    id?: number;
    candidateId?: number;
    vacancyId?: number;
    status: ApplicationStatus;
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
