import { apiClient } from "./apiClient";

export const candidateService = {
  // Obtener todos los candidatos (funciona OK)
  getAll: () => apiClient('/candidates', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),

  /**
   * NOTA: La actualización de estado "Contratado" ahora se maneja 
   * a través de vacanciesApi.updateStatus según la instrucción de José.
   * * Si se habilita una ruta para el estado individual del candidato, 
   * se agregaría aquí.
   */
};