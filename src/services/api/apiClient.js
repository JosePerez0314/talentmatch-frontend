const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Recuperamos el token que ahora el AuthContext SÍ guarda correctamente
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

    // Validación flexible de éxito (soporta 'success' y 'succes')
    const isSuccessFlag = responseBody?.success !== false && responseBody?.succes !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        // Opcional: podrías disparar un logout automático aquí
        throw new Error("Sesión expirada o no autorizada.");
      }
      throw new Error(responseBody?.error || responseBody?.message || `Error: ${response.status}`);
    }

    // CLAVE: Si hay una propiedad 'data', la devolvemos. 
    // Si no, devolvemos el objeto completo (útil para el Login y métricas directas)
    return responseBody?.data !== undefined ? responseBody.data : responseBody;

  } catch (error) {
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
};