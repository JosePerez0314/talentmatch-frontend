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
    // GET /vacancies incluye _count.candidates y el array completo de candidates
    _count?: { candidates: number };
    candidates?: Candidate[];
}

export interface Application {
    id?: number;
    vacancyId?: number;
    candidateId?: number;
    status: ApplicationStatus;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface Candidate {
    id: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
    phone?: string;
    fileUrl?: string;      // CV URL devuelto por GET /vacancies/:id/results
    resumeUrl?: string;    // legacy
    skills?: string[];
    niche?: string;
    status?: CandidateStatus;
    indexedAt?: string;
    createdAt?: string;
    applications?: Application[];
}

// Datos estructurados extraídos por la IA
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
    summary?: string;
    redFlags?: string;
    hardSkillsScore?: number;
    experienceScore?: number;
    roleScore?: number;
    languagesScore?: number;
    educationScore?: number;
    softSkillsScore?: number;
    matchReasoning?: string;
    normalizedCandidate?: string;
}

// INTERFACES DE RESPUESTA HTTP Y ERRORES

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

// Resultado por archivo en POST /vacancies/:id/upload
export interface UploadResult {
    success: boolean;
    data?: Candidate;
    message?: string;
    error?: string;
    stack?: string;
}

// Contrato específico del endpoint PATCH /api/vacancies/:vacancyId/candidates/:candidateId/status
// Nota: Directo { success, data } sin doble envoltura.
export interface UpdatedVacancyData {
    id: number;
    availableSlots: number;
    status: VacancyStatus;
}

export interface UpdateCandidateStatusData {
    application: Application | Record<string, unknown>;
    vacancy: UpdatedVacancyData;
}

export interface UpdateCandidateStatusResponse {
    success: boolean;
    data: UpdateCandidateStatusData;
}