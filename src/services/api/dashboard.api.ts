import { apiClient } from "./apiClient";
import { DashboardStats } from "../../types/dashboard.types";
import { ApiResponse } from "../../types/api.types";

export const dashboardService = {
  // Obtener el resumen de métricas del dashboard con tipado explícito
  getSummary: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiClient('/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};