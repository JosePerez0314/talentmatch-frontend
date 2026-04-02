const BASE_URL = import.meta.env.VITE_API_URL;

// Revisar porque la el try no cubre todo
export const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // 1. Verificamos si la respuesta es JSON antes de parsear
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        // Si no es OK, lanzamos error con el mensaje del servidor o uno genérico
        throw new Error(data?.message || `Error del servidor: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Log para el desarrollador, pero relanzamos para la UI
      console.error("API Error [login]:", error.message);
      throw error;
    }
  },
};