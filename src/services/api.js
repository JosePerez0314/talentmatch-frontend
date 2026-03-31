// Obtenemos la URL desde las variables de entorno de Vite
const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Servicio de Autenticación
 */
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

      // Si la respuesta no es 2xx, lanzamos el error para que el catch lo capture
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en la autenticación");
      }

      return await response.json(); // Retorna { token, user, etc. }
    } catch (error) {
      console.error("Error en authService.login:", error.message);
      throw error; // Re-lanzamos para que el componente maneje la UI
    }
  },
};