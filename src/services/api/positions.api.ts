import { apiClient } from "./apiClient";
import { Position, ApiResponse } from "../../types/api.types";

export interface CreatePositionInput {
  departmentId: string | number;
  role: string;
  yearsOfExperience: number;
  description: string;
  technicalSkills: string[];
  optionalTechnicalSkills: string[];
  softSkills: string[];
  educationLevel: string;
  education: string;
  languages: string[];
}

export const positionService = {
  // 1. Crear posición asistida por el Wizard (Manual)
  create: async (data: CreatePositionInput): Promise<ApiResponse<Position>> => {
    return apiClient('/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 2. Extraer datos con IA a partir de un archivo PDF (POST /positions/complete)
  completeWithAI: async (pdfFile: File): Promise<ApiResponse<Partial<CreatePositionInput>>> => {
    const formData = new FormData();
    formData.append("file", pdfFile);

    return apiClient('/positions/complete', {
      method: 'POST',
      // No seteamos Content-Type para que el navegador ponga automáticamente 'multipart/form-data' con su boundary
      body: formData as unknown as BodyInit, 
    });
  },

  // 3. Obtener todas las posiciones activas
  getAll: async (): Promise<ApiResponse<Position[]>> => {
    return apiClient('/positions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // (Módulo preparado para futuros requerimientos de la doc API)
  getById: async (id: number | string): Promise<ApiResponse<Position>> => {
    return apiClient(`/positions/${id}`, { method: 'GET' });
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return apiClient(`/positions/${id}`, { method: 'DELETE' });
  }
};