import { apiClient } from "./apiClient";

export const dashboardService = {
  getSummary: () => apiClient('/dashboard', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),
};