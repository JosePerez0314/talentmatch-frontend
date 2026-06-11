import { apiClient } from "./apiClient";
import { Vacancy, MatchResult, ApiResponse } from "../../types/api.types";

// 1. Interfaz estricta para la creación de vacantes
export interface CreateVacancyInput {
  positionId: number;
  title: string;
  location: string;
  salaryRange?: string;
  limitDate?: string;
}

export const vacanciesApi = {
  // Obtener todas las vacantes que no estén bajo borrado lógico (soft-delete)
  getAll: async (): Promise<ApiResponse<Vacancy[]>> => {
    return apiClient('/vacancies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Crear una nueva vacante enlazada a una posición
  create: async (data: CreateVacancyInput): Promise<ApiResponse<Vacancy>> => {
    return apiClient('/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Vista Drill-Down: Obtiene el Top 10 de candidatos ordenados por MatchScore para esta vacante
  getResults: async (vacancyId: number | string): Promise<ApiResponse<MatchResult[]>> => {
    return apiClient(`/vacancies/${vacancyId}/results`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Lazy Evaluation: Ejecuta el motor de IA JIT (Just-In-Time) y hace un Upsert en MatchResult
  calculateMatch: async (
    vacancyId: number | string,
    candidateId: string
  ): Promise<ApiResponse<MatchResult>> => {
    return apiClient(`/vacancies/${vacancyId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vacancyId, candidateId }),
    });
  },

  // Menú Kebab Contextual: Actualiza de forma segura el estado operativo de la vacante (OPEN, PAUSED, CLOSED)
  updateStatus: async (
    vacancyId: number | string,
    newStatus: 'OPEN' | 'PAUSED' | 'CLOSED'
  ): Promise<ApiResponse<Vacancy>> => {
    return apiClient(`/vacancies/${vacancyId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: String(newStatus).trim()
      }),
    });
  },
};