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
};