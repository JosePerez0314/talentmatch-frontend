import { apiClient } from "./apiClient";

export const vacanciesApi = {
  getAll: () => apiClient('/vacancies', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),
  create: (data) => apiClient('/vacancies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  // Corregido para usar el ID de la vacante específica
  getResults: (vacancyId) => apiClient(`/vacancies/${vacancyId}/results`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),
  calculateMatch: (vacancyId, candidateId) => apiClient(`/vacancies/${vacancyId}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vacancyId, candidateId }),
  }),
  updateStatus: (vacancyId, newStatus) => {
    return apiClient(`/vacancies/${vacancyId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: String(newStatus).trim()
      }),
    });
  },
};