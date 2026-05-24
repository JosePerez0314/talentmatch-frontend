import { apiClient } from "./apiClient";
import { Candidate, ApiResponse } from "../../types/api.types";

export const candidateService = {
  // Obtener todos los candidatos con tipado explícito de retorno
  getAll: async (): Promise<ApiResponse<Candidate[]>> => {
    return apiClient('/candidates', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },


  /**
   * NOTA: La actualización de estado "Contratado" ahora se maneja 
   * a través de vacanciesApi.updateStatus según la instrucción de José.
   * * Si se habilita una ruta para el estado individual del candidato, 
   * se agregaría aquí.
   */
};