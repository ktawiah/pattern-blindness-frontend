import { API_BASE_URL } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || errorData.detail || `HTTP error ${response.status}`,
        errorData.code,
      );
    }

    // Handle 204 No Content responses - return null
    if (response.status === 204) {
      return null as T;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError(408, "Request timeout");
      }
      throw new ApiError(0, error.message);
    }

    throw new ApiError(0, "An unexpected error occurred");
  }
}

function getAuthHeader(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("pattern-blindness-auth-token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
