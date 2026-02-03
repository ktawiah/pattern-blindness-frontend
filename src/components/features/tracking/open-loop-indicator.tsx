"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { profileApi, ActiveAttemptResponse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

// Custom event name for refreshing the open loop indicator
export const OPEN_LOOP_REFRESH_EVENT = "openloop:refresh";

// Helper function to trigger a refresh from anywhere in the app
export function refreshOpenLoopIndicator() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_LOOP_REFRESH_EVENT));
  }
}

export function OpenLoopIndicator() {
  const { isAuthenticated } = useAuth();
  const [activeAttempt, setActiveAttempt] = useState<ActiveAttemptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkActiveAttempt = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await profileApi.getActiveAttempt();
      setActiveAttempt(response);
    } catch {
      // No active attempt or error - that's fine
      setActiveAttempt(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkActiveAttempt();

    // Listen for refresh events from explicit completions
    const handleRefresh = () => {
      checkActiveAttempt();
    };

    window.addEventListener(OPEN_LOOP_REFRESH_EVENT, handleRefresh);
    
    return () => {
      window.removeEventListener(OPEN_LOOP_REFRESH_EVENT, handleRefresh);
    };
  }, [checkActiveAttempt]);

  if (!isAuthenticated || isLoading || !activeAttempt) {
    return null;
  }

  return (
    <Link
      href={`/practice/leetcode/${activeAttempt.attemptId}`}
      className="flex items-center gap-2 animate-pulse"
    >
      <Badge variant="destructive" className="flex items-center gap-1.5 py-1">
        <AlertCircle className="h-3 w-3" />
        <span className="hidden sm:inline">Open Loop: </span>
        <span className="max-w-32 truncate">{activeAttempt.problemTitle}</span>
      </Badge>
    </Link>
  );
}
