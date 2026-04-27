const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Handles JSON resolution, JWT injection, and standard backend errors automatically
 */
export const apiClient = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    
    // Clone existing headers or create new ones
    const headers = new Headers(options.headers || {});
    
    // TOKEN INJECTION: If it exists, we add it as a Bearer token
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseBody = isJson ? await response.json() : null;

    // Evaluate response.ok and the success flags
    const isSuccessFlag = responseBody?.success !== false && responseBody?.succes !== false;

    if (!response.ok || !isSuccessFlag) {
      // Handling of explicit 401 Unauthorized
      if (response.status === 401) {
        throw new Error("Sesión expirada o no autorizada. Por favor, inicia sesión nuevamente.");
      }
      throw new Error(responseBody?.error || responseBody?.message || `Error del servidor: ${response.status}`);
    }

    // return 'data', but if the backend sends 'token' or 'fileData'
    if (responseBody?.data !== undefined) {
      return responseBody.data;
    }
    return responseBody; 

  } catch (error) {
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
};