import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserInfo,
} from "@/types";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AuthError(
      response.status,
      errorData.title || errorData.message || `HTTP error ${response.status}`,
      errorData.errors,
    );
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export const authApi = {
  /**
   * Register a new user account.
   * ASP.NET Identity endpoint: POST /api/auth/register
   */
  register: async (data: RegisterRequest): Promise<void> => {
    await authFetch<void>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Login with email and password.
   * ASP.NET Identity endpoint: POST /api/auth/login
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await authFetch<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Store tokens
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.authToken, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
      // Set cookie for middleware auth check
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `pb_access_token=${response.accessToken}; path=/; max-age=${response.expiresIn}; SameSite=Lax${secure}`;
    }

    return response;
  },

  /**
   * Refresh the access token.
   * ASP.NET Identity endpoint: POST /api/auth/refresh
   */
  refresh: async (): Promise<TokenResponse> => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.refreshToken)
        : null;

    if (!refreshToken) {
      throw new AuthError(401, "No refresh token available");
    }

    const response = await authFetch<TokenResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    // Update stored tokens
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.authToken, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
    }

    return response;
  },

  /**
   * Get current user info.
   * ASP.NET Identity endpoint: GET /api/auth/manage/info
   */
  getUserInfo: async (): Promise<UserInfo> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.authToken)
        : null;

    if (!token) {
      throw new AuthError(401, "Not authenticated");
    }

    return authFetch<UserInfo>("/api/auth/manage/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Logout - clear stored tokens.
   */
  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.authToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      // Clear the auth cookie
      document.cookie = "pb_access_token=; path=/; max-age=0; SameSite=Lax";
    }
  },

  /**
   * Check if user has a stored token.
   */
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEYS.authToken);
  },

  /**
   * Get stored access token.
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.authToken);
  },
};
