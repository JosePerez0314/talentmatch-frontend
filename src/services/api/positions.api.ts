import { apiClient } from "./apiClient";
import { Position, ApiResponse } from "../../types/api.types";

// Interfaz para los datos requeridos al crear una posición desde el Stepper Wizard
export interface CreatePositionInput {
  title: string;
  description: string;
  requirements?: string;
  departmentId: number;
}

export const positionService = {
  // 1. Crear posición asistida por el Wizard
  create: async (data: CreatePositionInput): Promise<ApiResponse<Position>> => {
    return apiClient('/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 2. Obtener todas las posiciones activas e integradas relacionalmente
  getAll: async (): Promise<ApiResponse<Position[]>> => {
    return apiClient('/positions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};