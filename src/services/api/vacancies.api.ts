import { apiClient } from "./apiClient";
import { Vacancy, ApiResponse } from "../../types/api.types";

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
  getAll: async (): Promise<ApiResponse<Vacancy[]>> => {
    return apiClient('/vacancies', { method: 'GET' });
  },

  // GET /vacancies/:id - Detalle de vacante
  getById: async (id: number | string): Promise<ApiResponse<Vacancy>> => {
    return apiClient(`/vacancies/${id}`, { method: 'GET' });
  },

  // POST /vacancies/ - Crear vacante
  create: async (data: CreateVacancyInput): Promise<ApiResponse<Vacancy>> => {
    return apiClient('/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // PUT /vacancies/:id - Actualización
  update: async (id: number | string, data: Partial<CreateVacancyInput>): Promise<ApiResponse<Vacancy>> => {
    return apiClient(`/vacancies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // PATCH /vacancies/:id/status - Cambiar estado
  updateStatus: async (id: number | string, status: 'ACTIVE' | 'PAUSED' | 'CLOSED'): Promise<ApiResponse<Vacancy>> => {
    return apiClient(`/vacancies/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // DELETE /vacancies/:id - Eliminar vacante
  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return apiClient(`/vacancies/${id}`, { method: 'DELETE' });
  },

  // --- MÓDULO RESULTADOS Y EVALUACIÓN IA ---

  // GET /vacancies/:id/results - Obtener ranking de candidatos
  getResults: async (id: number | string, page = 1, limit = 20): Promise<ApiResponse<any>> => {
    return apiClient(`/vacancies/${id}/results?page=${page}&limit=${limit}`, { method: 'GET' });
  },

  // POST /vacancies/:id/upload - Subir PDF
  uploadCVs: async (id: number | string, files: File[]): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    files.forEach(file => formData.append("pdfs", file));

    return apiClient(`/vacancies/${id}/upload`, {
      method: 'POST',
      body: formData as unknown as BodyInit,
    });
  },

  // POST /vacancies/:id/evaluations - Ejecutar IA para evaluar
  evaluateCandidates: async (id: number | string): Promise<ApiResponse<any>> => {
    return apiClient(`/vacancies/${id}/evaluations`, { method: 'POST' });
  }
};