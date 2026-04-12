const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Handles JSON resolution and standard backend errors automatically
 */
export const apiClient = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, options);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseBody = isJson ? await response.json() : null;

    // // Handling the success flag and extracting the error message
    if (!response.ok || (responseBody && responseBody.success === false)) {
      throw new Error(responseBody?.error || `Error del servidor: ${response.status}`);
    }

    return responseBody?.data;
  } catch (error) {
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
};