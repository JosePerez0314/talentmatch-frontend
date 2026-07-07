const BASE_URL: string = import.meta.env.VITE_API_URL;

export interface ApiClientOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string> | HeadersInit;
}

//  ApiError
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  try {
    const baseUrlCleaned = BASE_URL.endsWith("/")
      ? BASE_URL.slice(0, -1)
      : BASE_URL;
    const url = `${baseUrlCleaned}${endpoint}`;

    const headers = new Headers(
      (options.headers as Record<string, string>) || {},
    );

    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const responseBody: unknown = isJson ? await response.json() : null;

    const rawBody = responseBody as Record<string, unknown> | null;

    // Desanida la doble envoltura de sendResponseOr404: { response: { success, data } }
    const envelope: Record<string, unknown> | null =
      rawBody && typeof rawBody === "object" && "response" in rawBody
        ? (rawBody.response as Record<string, unknown> | null)
        : rawBody;

    // success tolerante: boolean false y string "false" (caso 404 del helper)
    const successFlag = envelope?.success;
    const isSuccessFlag = successFlag !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        throw new ApiError(
          "Sesión expirada o no autorizada.",
          response.status,
          responseBody,
        );
      }

      // Mensaje legible; details de validación viaja estructurado en ApiError.data
      const errorMessage = String(
        envelope?.error || envelope?.message || `Error: ${response.status}`,
      );

      throw new ApiError(
        errorMessage,
        response.status,
        envelope?.details ?? responseBody,
      );
    }

    // Si el consumidor pide el sobre completo, devuelve { data, meta } sin desempaquetar
    if ((options as ApiClientOptions & { raw?: boolean }).raw) {
      return envelope as T;
    }

    // Devuelve data desempaquetada; si no hay data (login), el objeto normalizado
    if (envelope && envelope.data !== undefined) {
      return envelope.data as T;
    }

    return envelope as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error(
      `API Client Error [${options.method || "GET"} ${endpoint}]:`,
      err.message,
    );
    throw err;
  }
};
