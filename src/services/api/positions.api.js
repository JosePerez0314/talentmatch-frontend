import { apiClient } from "./apiClient";

export const positionService = {
  create: (data) => apiClient('/positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getAll: () => apiClient('/positions', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),
};