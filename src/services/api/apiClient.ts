const BASE_URL: string = import.meta.env.VITE_API_URL;

export interface ApiClientOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string> | HeadersInit;
}

//  ApiError
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  try {
    const baseUrlCleaned = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const url = `${baseUrlCleaned}${endpoint}`;

    const headers = new Headers(options.headers as Record<string, string> || {});

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
    const responseBody: unknown = isJson ? await response.json() : null;

    let castedBody = responseBody as Record<string, any> | null;

    // Desempaqueta response: success, data 
    if (castedBody && castedBody.response) {
      castedBody = castedBody.response as Record<string, any>;
    }

    // Manejar bug success: false
    const isSuccessFlag = 
      castedBody?.success !== false && 
      castedBody?.success !== "false" && 
      castedBody?.succes !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        throw new ApiError("Sesión expirada o no autorizada.", response.status, responseBody);
      }

      // Extrae mensaje de error
      const serverError = castedBody?.error || castedBody?.message || castedBody?.details || responseBody;
      const errorMessage = typeof serverError === 'object' ? JSON.stringify(serverError) : String(serverError || `Error: ${response.status}`);

      throw new ApiError(errorMessage, response.status, responseBody);
    }

    //Devolver data 
    if (castedBody && castedBody.data !== undefined) {
      return castedBody.data as T;
    }

    return castedBody as T;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
};