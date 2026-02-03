"use client";

import { useState, useEffect, useCallback } from "react";
import { profileApi, type FeatureAccessResponse, type UserProfileResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";

export interface FeaturePhaseState {
  isLoading: boolean;
  error: string | null;
  phase: number;
  problemsInPhase: number;
  problemsToNextPhase: number;
  completedAttempts: number;
  features: {
    showConfidenceMetrics: boolean;
    showPatternUsageStats: boolean;
    showBlindSpots: boolean;
    showPatternDecay: boolean;
    showThinkingReplay: boolean;
    showInterviewReadiness: boolean;
  };
  refresh: () => Promise<void>;
}

const DEFAULT_FEATURES = {
  showConfidenceMetrics: false,
  showPatternUsageStats: false,
  showBlindSpots: false,
  showPatternDecay: false,
  showThinkingReplay: false,
  showInterviewReadiness: false,
};

/**
 * Hook for accessing the user's feature phase and feature flags.
 *
 * Features are progressively unlocked based on completed attempts:
 * - Phase 1 (1-5 attempts): Basic flow only
 * - Phase 2 (6-15 attempts): Light stats, confidence metrics, pattern usage
 * - Phase 3 (16-30 attempts): Decay tracking, blind spot detection
 * - Phase 4 (31+ attempts): Interview readiness (opt-in)
 */
export function useFeaturePhase(): FeaturePhaseState {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      // If profile doesn't exist, user is in phase 1 with no features
      console.error("Failed to fetch user profile:", err);
      setError(null); // Don't show error, just use defaults
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading, fetchProfile]);

  const featureAccess: FeatureAccessResponse = profile?.featureAccess ?? {
    phase: 1,
    problemsInPhase: 0,
    problemsToNextPhase: 5,
    ...DEFAULT_FEATURES,
  };

  return {
    isLoading: isLoading || authLoading,
    error,
    phase: featureAccess.phase,
    problemsInPhase: featureAccess.problemsInPhase,
    problemsToNextPhase: featureAccess.problemsToNextPhase,
    completedAttempts: profile?.completedAttempts ?? 0,
    features: {
      showConfidenceMetrics: featureAccess.showConfidenceMetrics,
      showPatternUsageStats: featureAccess.showPatternUsageStats,
      showBlindSpots: featureAccess.showBlindSpots,
      showPatternDecay: featureAccess.showPatternDecay,
      showThinkingReplay: featureAccess.showThinkingReplay,
      showInterviewReadiness: featureAccess.showInterviewReadiness,
    },
    refresh: fetchProfile,
  };
}
