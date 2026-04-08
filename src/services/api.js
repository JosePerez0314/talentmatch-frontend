const BASE_URL = import.meta.env.VITE_API_URL;

// Global helper to inject the token in requests
const getHeaders = () => ({
  "Content-Type": "application/json",
});

//Request for Login.jsx
export const authService = {
  login: async (credentials) => {
    try {
      // Endpoint
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      // HTTP status like the backend 'success' flag
      if (!response.ok || (responseBody && responseBody.success === false)) {
        // We read 'standard' error from Railway
        throw new Error(responseBody?.error || `Error del servidor: ${response.status}`);
      }

      // return the 'data' object directly
      return responseBody.data; 
    } catch (error) {
      console.error("API Error [login]:", error.message);
      throw error; 
    }
  },
};

// Request for Position.jsx
export const positionService = {
  create: async (positionData) => {
    try {
      const response = await fetch(`${BASE_URL}/positions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(positionData),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      if (!response.ok || (responseBody && responseBody.success === false)) {
        throw new Error(responseBody?.error || `Error al crear posición: ${response.status}`);
      }

      return responseBody.data;
    } catch (error) {
      console.error("API Error [createPosition]:", error.message);
      throw error;
    }
  },
};