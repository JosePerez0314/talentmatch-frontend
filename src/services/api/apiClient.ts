const BASE_URL: string = import.meta.env.VITE_API_URL;

export interface ApiClientOptions extends Omit<RequestInit, "headers"> {
  raw?: boolean; // if is true, returns the full response object instead of just the data
  headers?: Record<string, string> | HeadersInit;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  details?: unknown;
}

interface WrappedApiResponse<T> {
  response: ApiResponse<T>;
}

type ExpressResponse<T> = ApiResponse<T> | WrappedApiResponse<T>;

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
    const responseBody = isJson
      ? ((await response.json()) as ExpressResponse<T>)
      : null;

    const standardResponse =
      responseBody &&
      typeof responseBody === "object" &&
      "response" in responseBody
        ? responseBody.response
        : responseBody;

    // success flag can be undefined, true or false. If it's undefined or true, we consider it a success. If it's false, we consider it a failure.
    const successFlag = standardResponse?.success;
    const isSuccessFlag = successFlag !== false;

    if (!response.ok || !isSuccessFlag) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("tm_user");
        window.location.href = "/login";
        
        throw new ApiError(
          "Sesión expirada o no autorizada.",
          response.status,
          responseBody,
        );
      }

      // Clean up the error message to avoid exposing sensitive informatiokn
      const errorMessage = String(
        standardResponse?.error ||
          standardResponse?.message ||
          `Error: ${response.status}`,
      );

      throw new ApiError(
        errorMessage,
        response.status,
        standardResponse?.details ?? responseBody,
      );
    }

    // If the comsumer wants the raw response, return it as is
    if ((options as ApiClientOptions & { raw?: boolean }).raw) {
      return standardResponse as T;
    }

    // Provide a more convenient way to access the data property if it exists
    if (standardResponse && standardResponse.data !== undefined) {
      return standardResponse.data as T;
    }

    return standardResponse as T;
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
