"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, AuthError } from "@/lib/api/auth";
import type { UserInfo, LoginRequest, RegisterRequest } from "@/types";
import { ROUTES } from "@/lib/constants";

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest, redirectTo?: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => setError(null), []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userInfo = await authApi.getUserInfo();
          setUser(userInfo);
        } catch (err) {
          // Only logout on auth errors (401/403), not network failures
          if (err instanceof AuthError && (err.status === 401 || err.status === 403)) {
            authApi.logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (data: LoginRequest, redirectTo?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await authApi.login(data);
        const userInfo = await authApi.getUserInfo();
        setUser(userInfo);
        // Use replace to avoid back button going to login page
        router.replace(redirectTo || ROUTES.practice);
      } catch (err) {
        if (err instanceof AuthError) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        await authApi.register(data);
        // Redirect to login so user can verify their credentials
        router.replace(`${ROUTES.login}?registered=true`);
      } catch (err) {
        if (err instanceof AuthError) {
          if (err.errors) {
            // Format validation errors
            const messages = Object.values(err.errors).flat().join(", ");
            setError(messages || err.message);
          } else {
            setError(err.message);
          }
        } else {
          setError("An unexpected error occurred");
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    router.push(ROUTES.home);
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (authApi.isAuthenticated()) {
      try {
        const userInfo = await authApi.getUserInfo();
        setUser(userInfo);
      } catch {
        authApi.logout();
        setUser(null);
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    error,
    clearError,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
