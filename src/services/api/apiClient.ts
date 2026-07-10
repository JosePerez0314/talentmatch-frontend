import { clearStoredSession, getStoredToken } from "../session";

const BASE_URL: string = import.meta.env.VITE_API_URL;

export interface ApiClientOptions extends Omit<RequestInit, "headers"> {
  raw?: boolean; // if is true, returns the full response object instead of just the data
  /**
   * Marks a request as hitting a route the API docs list as not requiring a
   * token (currently `/users/login` and `/users` register). Gates two things:
   *
   * 1. No stored token is attached. A stale or expired one sent to a public
   *    route can trip a backend auth middleware scoped too broadly, or turn
   *    the request into a CORS-preflighted one that a public route's CORS
   *    config never expected.
   * 2. No 401 session teardown. `POST /users/login` answers 401 for a wrong
   *    password, which must surface as a form error, not wipe the session
   *    and hard-navigate away from the form the user is looking at.
   */
  isPublicEndpoint?: boolean;
  headers?: Record<string, string> | HeadersInit;
}

const LOGIN_PATH = "/login";

/**
 * A 401 on an authenticated request means the token is gone or expired.
 * Without this the caller just throws, every screen renders its own error, and
 * the user stays stranded in an app that still looks signed in.
 */
const endExpiredSession = (): void => {
  clearStoredSession();
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
};

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

    if (!options.isPublicEndpoint) {
      const token = getStoredToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Keep our own options out of the fetch init.
    const { raw, isPublicEndpoint, ...requestInit } = options;

    const config: RequestInit = {
      ...requestInit,
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
        if (!isPublicEndpoint) endExpiredSession();

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
    if (raw) {
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
