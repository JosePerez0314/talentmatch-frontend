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
   *    config never expected — either way the request can be blocked before
   *    credentials are even checked.
   * 2. No 401 session teardown. `POST /users/login` answers 401 for a wrong
   *    password, which must surface as a form error, not wipe the session
   *    and hard-navigate away from the form the user is looking at.
   */
  isPublicEndpoint?: boolean;
  headers?: Record<string, string> | HeadersInit;
}

const LOGIN_PATH = "/login";

// Backoff schedule for 429s: 3 total attempts (initial + 2 retries).
const MAX_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 300;
const BACKOFF_JITTER_MS = 200;

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

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// `Retry-After` may be delta-seconds or an HTTP-date. Both are valid per RFC 9110.
const parseRetryAfter = (header: string | null): number | null => {
  if (!header) return null;
  const asSeconds = Number(header);
  if (Number.isFinite(asSeconds)) return Math.max(0, asSeconds * 1000);
  const asDate = Date.parse(header);
  if (Number.isFinite(asDate)) return Math.max(0, asDate - Date.now());
  return null;
};

const backoffFor = (attempt: number): number =>
  BACKOFF_BASE_MS * Math.pow(3, attempt) + Math.random() * BACKOFF_JITTER_MS;

/**
 * Wraps `fetch` with a 429-only retry loop. Any other status (including 5xx)
 * is returned as-is so the caller can decide. 429 is safe to retry for any
 * method because the server rejected before processing.
 */
const fetchWithRetry = async (
  url: string,
  config: RequestInit,
): Promise<Response> => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS - 1; attempt++) {
    const response = await fetch(url, config);
    if (response.status !== 429) return response;
    const wait =
      parseRetryAfter(response.headers.get("Retry-After")) ??
      backoffFor(attempt);
    console.warn(
      `[apiClient] 429 en ${url} — reintento ${attempt + 1}/${MAX_ATTEMPTS - 1} en ${Math.round(wait)}ms`,
    );
    await sleep(wait);
  }
  return fetch(url, config);
};

/**
 * Collapses identical concurrent GETs into a single in-flight promise. Kills
 * StrictMode's double-invocation of useEffect fetches in dev and merges the
 * usual race when two pages ask for the same list back-to-back. Only for GET —
 * merging POST/PUT/DELETE/PATCH would silently swallow mutations. Cleared as
 * soon as the request settles, so the window is bounded to the actual
 * concurrency window (a few hundred ms), not stale-cached across time.
 */
const inFlightGets = new Map<string, Promise<unknown>>();

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

export const apiClient = <T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const method = (options.method ?? "GET").toUpperCase();
  const dedupKey =
    method === "GET" ? `${endpoint}::${options.raw ? "raw" : "std"}` : null;

  if (dedupKey) {
    const existing = inFlightGets.get(dedupKey) as Promise<T> | undefined;
    if (existing) return existing;
  }

  const promise = executeApiRequest<T>(endpoint, options);

  if (dedupKey) {
    inFlightGets.set(dedupKey, promise);
    // Race-safe cleanup: only delete if the map still points to *this* promise.
    promise.finally(() => {
      if (inFlightGets.get(dedupKey) === promise) inFlightGets.delete(dedupKey);
    });
  }

  return promise;
};

const executeApiRequest = async <T = unknown>(
  endpoint: string,
  options: ApiClientOptions,
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

    const response = await fetchWithRetry(url, config);
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
