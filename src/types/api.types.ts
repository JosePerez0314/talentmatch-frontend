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
    departmentId: number | string;
    department?: Department;
    // Adaptado al nuevo Stepper de 4 pasos
    role: string;
    yearsOfExperience: number;
    description: string;
    technicalSkills: string[];
    optionalTechnicalSkills: string[];
    softSkills: string[];
    educationLevel: string;
    education: string;
    languages: string[];
    
    isDeleted?: boolean; 
    createdAt?: string;
}

export interface Vacancy {
    id: number;
    positionId: number;
    position?: Position;
    title: string;
    status: 'OPEN' | 'PAUSED' | 'CLOSED'; 
    location: string;
    salaryRange?: string;
    isDeleted: boolean; 
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
    niche: string; 
    status: 'AVAILABLE' | 'HIRED'; 
    indexedAt: string; 
    createdAt: string;
}

export interface MatchResult {
    id: number;
    vacancyId: number;
    candidateId: number;
    candidate?: Candidate;
    matchScore: number; 
    evaluatedAt: string; 
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface AuthResponse {
    token?: string;
    user?: { email: string };
    data?: {
        token?: string;
        user?: { email: string };
    };
}