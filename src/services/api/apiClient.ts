const BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  serverData: any;

  constructor(message: string, status: number, serverData: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.serverData = serverData;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiClientOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string> | HeadersInit;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  try {
    const url = `${BASE_URL}${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
    const headers = new Headers(options.headers as Record<string, string> || {});

    if (options.body && !(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

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

    const castedBody = responseBody as Record<string, unknown> | null;
    const isSuccessFlag = castedBody?.success !== false && castedBody?.succes !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        throw new ApiError("Sesión expirada o no autorizada.", response.status, responseBody);
      }

      const serverError = castedBody?.error || castedBody?.message || castedBody?.errors;
      const errorMessage = typeof serverError === 'object' ? JSON.stringify(serverError) : String(serverError || `Error: ${response.status}`);


      throw new ApiError(errorMessage, response.status, responseBody);
    }

    if (castedBody && castedBody.data !== undefined) {
      return castedBody.data as T;
    }

    return responseBody as T;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error(`API Client Error [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
};