const BASE_URL = import.meta.env.VITE_API_URL;

// Global helper to inject the token in requests
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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