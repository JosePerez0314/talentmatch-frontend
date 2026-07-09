import { apiClient } from "./apiClient";
import { Position } from "../../types/api.types";

export interface CreatePositionInput {
  departmentId: string | number;
  role: string;
  yearsOfExperience: number;
  description: string;
  technicalSkills: string[];
  optionalTechnicalSkills: string[];
  softSkills: string[];
  educationLevel: string;
  educationArea?: string;
  languages: string[];
}

export const positionService = {
  // GET /positions/ - Listar posiciones
  getAll: async (): Promise<Position[]> => {
    return apiClient<Position[]>('/positions', { method: 'GET' });
  },

  // GET /positions/:id - Detalle de posición
  getById: async (id: string | number): Promise<Position> => {
    return apiClient<Position>(`/positions/${id}`, { method: 'GET' });
  },

  // POST /positions/ - Crear posición manual
  create: async (data: CreatePositionInput): Promise<Position> => {
    return apiClient<Position>('/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // PUT /positions/:id - Actualizar posición
  update: async (id: string | number, data: Partial<CreatePositionInput>): Promise<Position> => {
    return apiClient<Position>(`/positions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // DELETE /positions/:id - Eliminar posición
  delete: async (id: string | number): Promise<void> => {
    return apiClient<void>(`/positions/${id}`, { method: 'DELETE' });
  },

  // POST /positions/complete - Extraer datos de PDF con IA
  completeWithAI: async (pdfFile: File): Promise<Partial<CreatePositionInput>> => {
    const formData = new FormData();
    formData.append("pdf", pdfFile);

    return apiClient<Partial<CreatePositionInput>>('/positions/complete', {
      method: 'POST',
      // No asignamos Content-Type para que el navegador genere el multipart/form-data automático
      body: formData as unknown as BodyInit,
    });
  },

  // POST /positions/duplicate/:id - Duplicar posicion
  duplicate: async (id: string | number): Promise<Position> => {
    return apiClient<Position>(`/positions/duplicate/${id}`, { method: 'POST' });
  }
};