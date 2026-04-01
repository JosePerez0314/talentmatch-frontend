// Retrieve the base URL from Vite environment variablese
const BASE_URL = import.meta.env.VITE_API_URL;


/**
 * Authentication Service
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

      // If the response status is not 2xx, throw an error so it can be handled by the catch block
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en la autenticación");
      }

      return await response.json(); // Returns { token, user, etc. }
    } catch (error) {
      console.error("Error en authService.login:", error.message);
      throw error; // Re-throw the error so the component can handle the UI state
    }
  },
};