"use client";

import { useState, useCallback } from "react";
import { COLD_START_DURATION_SECONDS } from "@/lib/constants";
import { useTimer } from "./use-timer";

export type PracticePhase = "thinking" | "hints" | "solution" | "reflection";

interface UseColdStartSessionOptions {
  problemId: string;
  onPhaseChange?: (phase: PracticePhase) => void;
}

interface UseColdStartSessionReturn {
  phase: PracticePhase;
  timeLeft: number;
  isTimerRunning: boolean;
  percentComplete: number;
  userNotes: string;
  setUserNotes: (notes: string) => void;
  confidenceLevel: number;
  setConfidenceLevel: (level: number) => void;
  hintsViewed: number;
  wrongApproachesViewed: string[];
  startSession: () => void;
  skipToHints: () => void;
  viewWrongApproach: (id: string) => void;
  viewSolution: () => void;
  completeSession: (wasCorrect: boolean) => void;
  resetSession: () => void;
}

export function useColdStartSession({
  onPhaseChange,
}: UseColdStartSessionOptions): UseColdStartSessionReturn {
  const [phase, setPhase] = useState<PracticePhase>("thinking");
  const [userNotes, setUserNotes] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [hintsViewed, setHintsViewed] = useState(0);
  const [wrongApproachesViewed, setWrongApproachesViewed] = useState<string[]>(
    [],
  );

  const handlePhaseChange = useCallback(
    (newPhase: PracticePhase) => {
      setPhase(newPhase);
      onPhaseChange?.(newPhase);
    },
    [onPhaseChange],
  );

  const handleTimerComplete = useCallback(() => {
    handlePhaseChange("hints");
  }, [handlePhaseChange]);

  const {
    timeLeft,
    isRunning: isTimerRunning,
    percentComplete,
    start: startTimer,
    reset: resetTimer,
  } = useTimer({
    duration: COLD_START_DURATION_SECONDS,
    onComplete: handleTimerComplete,
    autoStart: false,
  });

  const startSession = useCallback(() => {
    handlePhaseChange("thinking");
    startTimer();
  }, [handlePhaseChange, startTimer]);

  const skipToHints = useCallback(() => {
    handlePhaseChange("hints");
  }, [handlePhaseChange]);

  const viewWrongApproach = useCallback((id: string) => {
    setWrongApproachesViewed((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setHintsViewed((prev) => prev + 1);
  }, []);

  const viewSolution = useCallback(() => {
    handlePhaseChange("solution");
  }, [handlePhaseChange]);

  const completeSession = useCallback(() => {
    handlePhaseChange("reflection");
  }, [handlePhaseChange]);

  const resetSession = useCallback(() => {
    setPhase("thinking");
    setUserNotes("");
    setConfidenceLevel(3);
    setHintsViewed(0);
    setWrongApproachesViewed([]);
    resetTimer();
  }, [resetTimer]);

  return {
    phase,
    timeLeft,
    isTimerRunning,
    percentComplete,
    userNotes,
    setUserNotes,
    confidenceLevel,
    setConfidenceLevel,
    hintsViewed,
    wrongApproachesViewed,
    startSession,
    skipToHints,
    viewWrongApproach,
    viewSolution,
    completeSession,
    resetSession,
  };
}
