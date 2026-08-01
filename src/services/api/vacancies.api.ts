import { apiClient } from "./apiClient";
import {
  Application,
  ApplicationStatus,
  MatchResult,
  UploadResult,
  Vacancy,
  VacancyStatus,
} from "../../types/api.types";

type CandidateStatusResult = {
  application: Application;
  vacancy: { id: number; availableSlots: number; status: VacancyStatus };
};

// Interfaz
export interface CreateVacancyInput {
  title: string;
  availableSlots: number;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  departmentId: number;
  positionId: number;
}

export const vacanciesApi = {
  // GET /vacancies/ - Listar vacantes
  getAll: async (): Promise<Vacancy[]> => {
    return apiClient<Vacancy[]>('/vacancies', { method: 'GET' });
  },

  // GET /vacancies/:id - Detalle de vacante
  getById: async (id: number | string): Promise<Vacancy> => {
    return apiClient<Vacancy>(`/vacancies/${id}`, { method: 'GET' });
  },

  // POST /vacancies/ - Crear vacante
  create: async (data: CreateVacancyInput): Promise<Vacancy> => {
    return apiClient<Vacancy>('/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // PUT /vacancies/:id - Actualización
  update: async (id: number | string, data: Partial<CreateVacancyInput>): Promise<Vacancy> => {
    return apiClient<Vacancy>(`/vacancies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // PATCH /vacancies/:id/status - Cambiar estado
  updateStatus: async (id: number | string, status: 'ACTIVE' | 'PAUSED' | 'CLOSED'): Promise<Vacancy> => {
    return apiClient<Vacancy>(`/vacancies/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // DELETE /vacancies/:id - Eliminar vacante
  delete: async (id: number | string): Promise<void> => {
    return apiClient<void>(`/vacancies/${id}`, { method: 'DELETE' });
  },

  // --- MÓDULO RESULTADOS Y EVALUACIÓN IA ---

  // GET /vacancies/:id/results - Obtener ranking de candidatos
  getResults: async (id: number | string, page = 1, limit = 20): Promise<MatchResult[]> => {
    return apiClient<MatchResult[]>(`/vacancies/${id}/results?page=${page}&limit=${limit}`, { method: 'GET' });
  },

  // POST /vacancies/:id/upload - Subir PDF
  uploadCVs: async (id: number | string, files: File[]): Promise<UploadResult[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append("pdfs", file));

    return apiClient<UploadResult[]>(`/vacancies/${id}/upload`, {
      method: 'POST',
      body: formData as unknown as BodyInit,
    });
  },

  // POST /vacancies/:id/evaluations - Ejecutar IA para evaluar
  evaluateCandidates: async (id: number | string): Promise<MatchResult[]> => {
    return apiClient<MatchResult[]>(`/vacancies/${id}/evaluations`, { method: 'POST' });
  },

  // PATCH /vacancies/:vacancyId/candidates/:candidateId/status - Cambiar estado del candidato
  updateCandidateStatus: async (
    vacancyId: number | string,
    candidateId: number | string,
    status: ApplicationStatus,
  ): Promise<CandidateStatusResult> => {
    return apiClient<CandidateStatusResult>(
      `/vacancies/${vacancyId}/candidates/${candidateId}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    );
  },
};