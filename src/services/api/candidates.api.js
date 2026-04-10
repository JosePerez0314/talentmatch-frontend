import { apiClient } from "./apiClient";

export const candidateService = {
  getAll: () => apiClient('/candidates', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),
};