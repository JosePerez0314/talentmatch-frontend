const BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 1. Interfaz para tipar de forma segura las opciones extendiendo de RequestInit de JS
export interface ApiClientOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string> | HeadersInit;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  try {
    const url = `${BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers as Record<string, string> || {});

    // Recuperamos el token que el AuthContext guarda correctamente
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    const isJson = response.headers.get('content-type')?.includes('application/json');

    // Tratamos el cuerpo crudo temporalmente como unknown para forzar validación estricta
    const responseBody: unknown = isJson ? await response.json() : null;

    // Type casting seguro para auditar banderas de éxito sin usar 'any'
    const castedBody = responseBody as Record<string, unknown> | null;
    const isSuccessFlag = castedBody?.success !== false && castedBody?.succes !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        throw new Error("Sesión expirada o no autorizada.");
      }
      const errorMessage = String(castedBody?.error || castedBody?.message || `Error: ${response.status}`);
      throw new Error(errorMessage);
    }

    // CLAVE: Si la respuesta tiene una propiedad 'data', la devolvemos casteada.
    // Si no, devolvemos el objeto completo (vital para el flujo de Login y métricas directas)
    if (castedBody && castedBody.data !== undefined) {
      return castedBody.data as T;
    }

    return responseBody as T;

  } catch (error) {
    const err = error as Error;
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
};