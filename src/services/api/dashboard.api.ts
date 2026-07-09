import { apiClient } from "./apiClient";
import { DashboardSummary } from "../../types/dashboard.types";

export const dashboardService = {
  // GET /dashboard - Resumen de métricas del usuario (ver API §7)
  getSummary: async (): Promise<DashboardSummary> => {
    return apiClient<DashboardSummary>('/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};