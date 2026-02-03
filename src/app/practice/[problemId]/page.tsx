"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ColdStartTimer,
  ThinkingNotes,
} from "@/components/features/cold-start";
import { WrongApproachCard } from "@/components/features/problems";
import { ConfidenceSelector } from "@/components/features/tracking";
import { Header } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import {
  problemApi,
  patternApi,
  attemptApi,
  type ColdStartSettingsResponse,
} from "@/lib/api";
import {
  COLD_START_DURATION_SECONDS,
  INTERVIEW_PROMPTS,
  DIFFICULTY_COLORS,
} from "@/lib/constants";
import type {
  ProblemResponse,
  ProblemWithSolutionResponse,
  PatternResponse,
} from "@/types";
import { getDifficultyLabel } from "@/types";

type PracticePhase =
  | "loading"
  | "ready"
  | "thinking"
  | "patterns"
  | "wrong-reveal"
  | "solution"
  | "return-gate"
  | "reflection";

type ApproachOutcome = "Worked" | "PartiallyWorked" | "Failed";
type FailureReason =
  | "WrongInvariant"
  | "EdgeCase"
  | "TimeComplexity"
  | "ImplementationBug"
  | "SpaceComplexity"
  | "Other";

interface PageProps {
  params: Promise<{ problemId: string }>;
}

export default function PracticeSessionPage({ params }: PageProps) {
  const { problemId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Data state
  const [problem, setProblem] = useState<ProblemResponse | null>(null);
  const [solution, setSolution] = useState<ProblemWithSolutionResponse | null>(
    null,
  );
  const [patterns, setPatterns] = useState<PatternResponse[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cold start settings (adaptive timer)
  const [coldStartSettings, setColdStartSettings] =
    useState<ColdStartSettingsResponse | null>(null);
  const [timerDuration, setTimerDuration] = useState(
    COLD_START_DURATION_SECONDS,
  );
  const [interviewPrompt, setInterviewPrompt] = useState<string>(
    INTERVIEW_PROMPTS.moderate,
  );

  // Session state
  const [phase, setPhase] = useState<PracticePhase>("loading");
  const [timeLeft, setTimeLeft] = useState(COLD_START_DURATION_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [rejectedPatterns, setRejectedPatterns] = useState("");

  // Multiple hypothesis mode state
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [secondaryPattern, setSecondaryPattern] = useState<string | null>(null);
  const [primaryVsSecondaryReason, setPrimaryVsSecondaryReason] = useState("");
  const [showMultipleHypothesis, setShowMultipleHypothesis] = useState(false);

  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  // Approach lock-in (invariant/risk)
  const [keyInvariant, setKeyInvariant] = useState("");
  const [primaryRisk, setPrimaryRisk] = useState("");

  // Return gate
  const [outcome, setOutcome] = useState<ApproachOutcome | "">("");
  const [firstFailure, setFirstFailure] = useState<FailureReason | "">("");
  const [switchedApproach, setSwitchedApproach] = useState(false);
  const [switchReason, setSwitchReason] = useState("");

  // Fetch problem and cold start settings on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [problemData, patternsData] = await Promise.all([
          problemApi.getById(problemId),
          patternApi.getAll(),
        ]);
        setProblem(problemData);
        setPatterns(patternsData);

        // Fetch adaptive cold start settings if authenticated
        if (isAuthenticated) {
          try {
            const settings = await attemptApi.getColdStartSettings();
            setColdStartSettings(settings);
            setTimerDuration(settings.recommendedDurationSeconds);
            setTimeLeft(settings.recommendedDurationSeconds);
            setInterviewPrompt(settings.interviewPrompt);
            setShowMultipleHypothesis(settings.recommendMultipleHypothesis);
          } catch {
            // Use defaults if settings fetch fails
            console.log("Using default cold start settings");
          }
        }

        setPhase("ready");
      } catch (err) {
        console.error("Failed to fetch problem:", err);
        setError("Failed to load problem. Please try again.");
      }
    }

    fetchData();
  }, [problemId, isAuthenticated]);

  // Timer effect - countdown only, uses functional state update for transition
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle timer completion separately
  useEffect(() => {
    if (timeLeft === 0 && phase === "thinking" && !isTimerRunning) {
      // Use a microtask to avoid the React warning about setState in effect
      queueMicrotask(() => {
        setPhase("patterns");
      });
    }
  }, [timeLeft, phase, isTimerRunning]);

  const handleStartSession = async () => {
    setPhase("thinking");
    setIsTimerRunning(true);

    // Start an attempt if authenticated
    if (isAuthenticated) {
      try {
        const result = await attemptApi.start(problemId);
        setAttemptId(result.id);
      } catch (err) {
        console.error("Failed to start attempt:", err);
        // Continue without tracking - user can still practice
      }
    }
  };

  const handleSubmitPatternSelection = async () => {
    if (!selectedPattern) return;
    if (!keyInvariant.trim() || !primaryRisk.trim()) {
      setError("Please fill in the key invariant and primary risk before continuing.");
      return;
    }

    // Submit cold start data if we have an attempt
    if (attemptId && isAuthenticated) {
      try {
        // Calculate elapsed time, ensuring it's at least the minimum (with small tolerance)
        const elapsedTime = timerDuration - timeLeft;
        const minimumRequired =
          coldStartSettings?.recommendedDurationSeconds || 30;
        const thinkingDuration = Math.max(elapsedTime, minimumRequired - 5);

        await attemptApi.submitColdStart(attemptId, {
          identifiedSignals: userNotes,
          rejectedPatterns: rejectedPatterns,
          chosenPatternId: selectedPattern,
          secondaryPatternId: secondaryPattern || undefined,
          primaryVsSecondaryReason: primaryVsSecondaryReason || undefined,
          thinkingDurationSeconds: thinkingDuration,
          keyInvariant,
          primaryRisk,
        });
      } catch (err) {
        console.error("Failed to submit cold start:", err);
        // Show error to user but allow them to continue practicing
        setError(
          "Failed to save your progress, but you can continue practicing.",
        );
      }
    }

    // Go to wrong approach reveal phase first
    setPhase("wrong-reveal");
  };

  const handleContinueToSolution = () => {
    setPhase("solution");
  };

  const handleGoToReturnGate = () => {
    setPhase("return-gate");
  };

  const handleComplete = async () => {
    if (!outcome) {
      setError("Please select how your approach worked.");
      return;
    }
    if ((outcome === "PartiallyWorked" || outcome === "Failed") && !firstFailure) {
      setError("Please select what broke first.");
      return;
    }
    if (switchedApproach && !switchReason.trim()) {
      setError("Please explain why you switched approaches.");
      return;
    }

    // Determine if correct based on outcome
    const correct = outcome === "Worked";
    setWasCorrect(correct);

    // Complete the attempt and get solution
    if (attemptId && isAuthenticated) {
      try {
        const solutionData = await attemptApi.complete(attemptId, {
          confidence: confidenceLevel,
          outcome: outcome as "Worked" | "PartiallyWorked" | "Failed",
          firstFailure: firstFailure ? (firstFailure as "WrongInvariant" | "EdgeCase" | "TimeComplexity" | "ImplementationBug" | "SpaceComplexity" | "Other") : undefined,
          switchedApproach,
          switchReason: switchedApproach ? switchReason : undefined,
        });
        setSolution(solutionData);
      } catch (err) {
        console.error("Failed to complete attempt:", err);
        // Still show the reflection phase, but the solution might not be available
        setError(
          "Failed to save completion. Your progress may not be recorded.",
        );
      }
    }

    setPhase("reflection");
  };

  const handleTryAnother = () => {
    router.push("/practice");
  };

  // Loading state
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !problem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-destructive mb-4">
                  {error || "Problem not found"}
                </p>
                <Link href="/practice">
                  <Button>Back to Problems</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Pre-session view
  if (phase === "ready") {
    const timerMinutes = Math.floor(timerDuration / 60);
    const timerSeconds = timerDuration % 60;
    const timerDisplay =
      timerMinutes > 0
        ? `${timerMinutes} minute${timerMinutes > 1 ? "s" : ""}${timerSeconds > 0 ? ` ${timerSeconds} seconds` : ""}`
        : `${timerSeconds} seconds`;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProblemCard problem={problem} />

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-center">
                  🎯 Interview Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interview-style prompt */}
                <div className="bg-muted/50 border-l-4 border-primary p-4 rounded-r-lg">
                  <p className="text-lg italic text-foreground">
                    &ldquo;{interviewPrompt}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    — Your interviewer
                  </p>
                </div>

                {/* Timer info */}
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    You&apos;ll have <strong>{timerDisplay}</strong> to think
                    before selecting a pattern.
                  </p>
                  {coldStartSettings && (
                    <Badge
                      variant={
                        coldStartSettings.performanceTier === "struggling"
                          ? "destructive"
                          : coldStartSettings.performanceTier === "moderate"
                            ? "secondary"
                            : "default"
                      }
                    >
                      Based on {coldStartSettings.recentAccuracyPercent}%
                      accuracy ({coldStartSettings.attemptsSampled} recent
                      attempts)
                    </Badge>
                  )}
                </div>

                {/* Multiple hypothesis mode indicator */}
                {showMultipleHypothesis && (
                  <Alert>
                    <AlertTitle>🧠 Multiple Hypothesis Mode</AlertTitle>
                    <AlertDescription>
                      You&apos;ll be asked to rank your top 2 pattern choices
                      and explain why you prefer one over the other. This builds
                      interview judgment.
                    </AlertDescription>
                  </Alert>
                )}

                {!isAuthenticated && (
                  <Alert>
                    <AlertDescription>
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        Log in
                      </Link>{" "}
                      to track your progress and get personalized timer
                      recommendations.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <Button size="lg" onClick={handleStartSession}>
                    Start Cold Start Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Phase Indicator */}
          <PhaseIndicator currentPhase={phase} />

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Left Column - Problem */}
            <div>
              <ProblemCard
                problem={problem}
                showSolution={phase === "solution" || phase === "reflection"}
                solution={solution}
              />
            </div>

            {/* Right Column - Session Content */}
            <div className="space-y-6">
              {/* Thinking Phase */}
              {phase === "thinking" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">
                        Cold Start Phase
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Interview prompt reminder */}
                      <div className="bg-muted/30 p-3 rounded-lg text-sm italic text-muted-foreground text-center">
                        &ldquo;{interviewPrompt}&rdquo;
                      </div>

                      <ColdStartTimer
                        timeLeft={timeLeft}
                        totalDuration={timerDuration}
                      />

                      <div className="space-y-4">
                        <ThinkingNotes
                          value={userNotes}
                          onChange={setUserNotes}
                          disabled={!isTimerRunning && timeLeft > 0}
                          placeholder="What signals do you see? What patterns might apply? Walk through your thinking..."
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Which patterns are you rejecting and why? (Important
                            for learning!)
                          </label>
                          <textarea
                            value={rejectedPatterns}
                            onChange={(e) =>
                              setRejectedPatterns(e.target.value)
                            }
                            disabled={!isTimerRunning && timeLeft > 0}
                            placeholder="e.g., I'm rejecting Binary Search because the array isn't sorted..."
                            className="w-full min-h-[80px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {timeLeft > 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                          ⏱️ Use this time to think deeply. No shortcuts!
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {timeLeft === 0 && (
                    <div className="text-center">
                      <Button onClick={() => setPhase("patterns")}>
                        Continue to Pattern Selection →
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Pattern Selection Phase */}
              {phase === "patterns" && (
                <>
                  <Alert>
                    <AlertTitle>
                      {timeLeft === 0 ? "Time's up!" : "Ready to commit?"}
                    </AlertTitle>
                    <AlertDescription>
                      {showMultipleHypothesis
                        ? "Select your primary pattern choice, then optionally add a backup hypothesis."
                        : "Based on the signals you identified, select the pattern you think applies."}
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg">
                        {userNotes || "No notes recorded."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Primary Pattern Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          1
                        </span>
                        Primary Pattern Choice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {patterns.map((pattern) => (
                        <div
                          key={pattern.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPattern === pattern.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary"
                              : secondaryPattern === pattern.id
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:border-primary/50"
                          }`}
                          onClick={() => {
                            if (secondaryPattern !== pattern.id) {
                              setSelectedPattern(pattern.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{pattern.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {pattern.description}
                              </p>
                            </div>
                            {selectedPattern === pattern.id && (
                              <Badge variant="default">Primary</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Secondary Pattern Selection (Multiple Hypothesis Mode) */}
                  {showMultipleHypothesis && selectedPattern && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                            2
                          </span>
                          Backup Hypothesis (Optional)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          What&apos;s your second choice if the primary
                          doesn&apos;t work out?
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {patterns
                            .filter((p) => p.id !== selectedPattern)
                            .map((pattern) => (
                              <div
                                key={pattern.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  secondaryPattern === pattern.id
                                    ? "border-secondary bg-secondary/10"
                                    : "hover:border-secondary/50"
                                }`}
                                onClick={() =>
                                  setSecondaryPattern(
                                    secondaryPattern === pattern.id
                                      ? null
                                      : pattern.id,
                                  )
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">
                                    {pattern.name}
                                  </h4>
                                  {secondaryPattern === pattern.id && (
                                    <Badge variant="secondary">Backup</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Reasoning for primary over secondary */}
                        {secondaryPattern && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Why do you prefer your primary choice?
                            </label>
                            <textarea
                              value={primaryVsSecondaryReason}
                              onChange={(e) =>
                                setPrimaryVsSecondaryReason(e.target.value)
                              }
                              placeholder="e.g., The constraints suggest O(n) is needed, and Two Pointers gives that while Hash Map uses extra space..."
                              className="w-full min-h-[60px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-6">
                      <ConfidenceSelector
                        value={confidenceLevel}
                        onChange={setConfidenceLevel}
                      />
                    </CardContent>
                  </Card>

                  {/* Approach Lock-In */}
                  {selectedPattern && (
                    <Card className="border-primary/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                            3
                          </span>
                          Lock In Your Approach
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Before coding, commit to what must remain true and where this could fail.
                        </p>

                        <div className="space-y-2">
                          <Label htmlFor="invariant">
                            Key Invariant: What must remain true throughout your solution?
                          </Label>
                          <textarea
                            id="invariant"
                            value={keyInvariant}
                            onChange={(e) => setKeyInvariant(e.target.value)}
                            placeholder="e.g., 'Left pointer always points to a smaller element than right pointer', 'Prefix sum array maintains cumulative totals'..."
                            className="w-full min-h-[60px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="risk">
                            Primary Risk: Where could this approach fail?
                          </Label>
                          <textarea
                            id="risk"
                            value={primaryRisk}
                            onChange={(e) => setPrimaryRisk(e.target.value)}
                            placeholder="e.g., 'Edge case with empty array', 'Time limit exceeded if nested loops needed', 'Off-by-one error at boundaries'..."
                            className="w-full min-h-[60px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleSubmitPatternSelection}
                      disabled={!selectedPattern || !keyInvariant.trim() || !primaryRisk.trim()}
                    >
                      Lock In & Continue
                    </Button>
                  </div>
                </>
              )}

              {/* Wrong Approach Reveal Phase */}
              {phase === "wrong-reveal" && (
                <>
                  <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <AlertTitle>⚠️ Before You See the Solution...</AlertTitle>
                    <AlertDescription>
                      Let&apos;s examine the common wrong approaches first. This
                      helps build intuition for why certain patterns don&apos;t
                      work.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Choice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Primary</Badge>
                          <span className="font-medium">
                            {patterns.find((p) => p.id === selectedPattern)
                              ?.name || "None"}
                          </span>
                        </div>

                        {secondaryPattern && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Backup</Badge>
                            <span className="text-sm">
                              {patterns.find((p) => p.id === secondaryPattern)
                                ?.name || "None"}
                            </span>
                          </div>
                        )}

                        {primaryVsSecondaryReason && (
                          <div className="text-sm border-t pt-2 mt-2">
                            <strong>Your reasoning:</strong>
                            <p className="mt-1 text-muted-foreground italic">
                              &ldquo;{primaryVsSecondaryReason}&rdquo;
                            </p>
                          </div>
                        )}

                        <p className="text-sm">
                          <strong>Confidence:</strong> {confidenceLevel}/5
                        </p>

                        {rejectedPatterns && (
                          <div className="text-sm">
                            <strong>Patterns you rejected:</strong>
                            <p className="mt-1 text-muted-foreground">
                              {rejectedPatterns}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>🤔</span> Common Wrong Approaches
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Many engineers try these approaches and hit walls.
                        Understanding <em>why</em> they fail is key to pattern
                        recognition.
                      </p>

                      <div className="space-y-3">
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/50">
                          <h4 className="font-medium text-red-700 dark:text-red-300">
                            Brute Force Approach
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Nested loops or checking all possibilities works but
                            typically results in O(n²) or worse time complexity.
                            The pattern you should use reduces this
                            significantly.
                          </p>
                        </div>

                        <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/50 dark:bg-orange-950/50">
                          <h4 className="font-medium text-orange-700 dark:text-orange-300">
                            Missing Key Insight
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            There&apos;s usually a mathematical property or
                            invariant that allows for a more elegant solution.
                            Look for signals in the problem constraints.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <Button size="lg" onClick={handleContinueToSolution}>
                      I&apos;ve Reflected → Show Solution
                    </Button>
                  </div>
                </>
              )}

              {/* Solution Phase */}
              {phase === "solution" && (
                <>
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <AlertTitle>Solution Revealed</AlertTitle>
                    <AlertDescription>
                      Now go implement this solution on LeetCode or your preferred platform.
                      Come back when you&apos;re done to report your results.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm">
                          <strong>Your pattern choice:</strong>{" "}
                          {patterns.find((p) => p.id === selectedPattern)
                            ?.name || "None"}
                        </p>
                        <p className="text-sm">
                          <strong>Key invariant:</strong> {keyInvariant}
                        </p>
                        <p className="text-sm">
                          <strong>Primary risk:</strong> {primaryRisk}
                        </p>
                        <p className="text-sm">
                          <strong>Confidence level:</strong> {confidenceLevel}/5
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <Button size="lg" onClick={handleGoToReturnGate}>
                      I&apos;ve Coded It → Report Results
                    </Button>
                  </div>
                </>
              )}

              {/* Return Gate Phase */}
              {phase === "return-gate" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Your Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Outcome */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">How did your approach work?</Label>
                        <RadioGroup
                          value={outcome}
                          onValueChange={(value) => setOutcome(value as ApproachOutcome)}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                            <RadioGroupItem value="Worked" id="worked" />
                            <Label htmlFor="worked" className="flex-1 cursor-pointer">
                              <span className="font-medium">Worked</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                Passed all test cases with my approach
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                            <RadioGroupItem value="PartiallyWorked" id="partial" />
                            <Label htmlFor="partial" className="flex-1 cursor-pointer">
                              <span className="font-medium">Partially Worked</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                The approach was right but needed adjustments
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer">
                            <RadioGroupItem value="Failed" id="failed" />
                            <Label htmlFor="failed" className="flex-1 cursor-pointer">
                              <span className="font-medium">Failed</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                The approach didn&apos;t work
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* What broke first */}
                      {(outcome === "PartiallyWorked" || outcome === "Failed") && (
                        <div className="space-y-3">
                          <Label className="text-base font-medium">What broke first?</Label>
                          <Select
                            value={firstFailure}
                            onValueChange={(value) => setFirstFailure(value as FailureReason)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select what caused the failure..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WrongInvariant">
                                Wrong Invariant - My core assumption was wrong
                              </SelectItem>
                              <SelectItem value="EdgeCase">
                                Edge Case - Failed on boundary conditions
                              </SelectItem>
                              <SelectItem value="TimeComplexity">
                                Time Complexity - Time Limit Exceeded
                              </SelectItem>
                              <SelectItem value="SpaceComplexity">
                                Space Complexity - Memory Limit Exceeded
                              </SelectItem>
                              <SelectItem value="ImplementationBug">
                                Implementation Bug - Logic was right, code was wrong
                              </SelectItem>
                              <SelectItem value="Other">
                                Other
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Switched approach */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="switched" className="text-base font-medium">
                            Did you switch approaches mid-solve?
                          </Label>
                          <Switch
                            id="switched"
                            checked={switchedApproach}
                            onCheckedChange={setSwitchedApproach}
                          />
                        </div>
                      </div>

                      {/* Switch reason */}
                      {switchedApproach && (
                        <div className="space-y-2">
                          <Label htmlFor="switchReason">What made you switch?</Label>
                          <textarea
                            id="switchReason"
                            value={switchReason}
                            onChange={(e) => setSwitchReason(e.target.value)}
                            placeholder="e.g., 'Realized sliding window wouldn't handle negative numbers'..."
                            className="w-full min-h-[60px] p-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                      )}

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setPhase("solution")}>
                      Back
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleComplete}
                      disabled={!outcome}
                    >
                      Complete & See Reflection
                    </Button>
                  </div>
                </>
              )}

              {/* Reflection Phase */}
              {phase === "reflection" && (
                <>
                  <Card
                    className={
                      wasCorrect ? "border-green-500" : "border-yellow-500"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-center">
                        {wasCorrect ? "🎉 Great job!" : "💪 Keep practicing!"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        {wasCorrect
                          ? "You identified the right pattern. Your pattern recognition is improving!"
                          : "Don't worry - analyzing wrong approaches helps build intuition for next time."}
                      </p>

                      <div className="bg-muted p-4 rounded-lg text-left">
                        <p className="text-sm">
                          <strong>Your confidence:</strong> {confidenceLevel}/5
                        </p>
                        <p className="text-sm">
                          <strong>Actual result:</strong>{" "}
                          {wasCorrect ? "Correct" : "Incorrect"}
                        </p>
                        {solution && (
                          <p className="text-sm">
                            <strong>Correct pattern:</strong>{" "}
                            {solution.correctPatternName}
                          </p>
                        )}
                      </div>

                      {/* Show wrong approaches if available */}
                      {solution && solution.wrongApproaches.length > 0 && (
                        <div className="text-left space-y-3">
                          <h4 className="font-medium">
                            Common Wrong Approaches:
                          </h4>
                          {solution.wrongApproaches.map((wa, idx) => (
                            <WrongApproachCard
                              key={idx}
                              approach={{
                                id: `wa-${idx}`,
                                problemId: problem.id,
                                description: wa.patternName,
                                whyItFails: wa.explanation,
                                commonMistake: `${wa.frequencyPercent}% of people try this`,
                              }}
                              isViewed={true}
                              onView={() => {}}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex gap-4 justify-center pt-4">
                        <Link href="/practice">
                          <Button variant="outline">Back to Problems</Button>
                        </Link>
                        <Button onClick={handleTryAnother}>
                          Try Another Problem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProblemCard({
  problem,
  showSolution = false,
  solution,
}: {
  problem: ProblemResponse;
  showSolution?: boolean;
  solution?: ProblemWithSolutionResponse | null;
}) {
  const difficultyLabel = getDifficultyLabel(problem.difficulty);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle>{problem.title}</CardTitle>
          <Badge className={DIFFICULTY_COLORS[difficultyLabel]}>
            {difficultyLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {problem.constraints.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {problem.examples.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Examples</h3>
            <div className="space-y-2">
              {problem.examples.map((ex, i) => (
                <pre
                  key={i}
                  className="bg-muted p-3 rounded text-sm overflow-x-auto"
                >
                  {ex}
                </pre>
              ))}
            </div>
          </div>
        )}

        {problem.signals.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Key Signals</h3>
            <div className="flex flex-wrap gap-2">
              {problem.signals.map((signal, i) => (
                <Badge key={i} variant="outline">
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Solution details - only shown after completion */}
        {showSolution && solution && (
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-2 text-green-600 dark:text-green-400">
                ✅ Correct Pattern: {solution.correctPatternName}
              </h3>
            </div>

            <div>
              <h3 className="font-medium mb-2">Key Invariant</h3>
              <p className="text-muted-foreground">{solution.keyInvariant}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Solution Explanation</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {solution.solutionExplanation}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PhaseIndicator({ currentPhase }: { currentPhase: PracticePhase }) {
  const phases: { key: PracticePhase; label: string; icon: string }[] = [
    { key: "thinking", label: "Think", icon: "🧠" },
    { key: "patterns", label: "Commit", icon: "🎯" },
    { key: "wrong-reveal", label: "Why Not?", icon: "🤔" },
    { key: "solution", label: "Code", icon: "💻" },
    { key: "return-gate", label: "Report", icon: "📝" },
    { key: "reflection", label: "Reflect", icon: "📊" },
  ];

  const currentIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        {phases.map((phase, index) => (
          <div key={phase.key} className="flex items-center">
            <div
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  index <= currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              <span aria-hidden="true">{phase.icon}</span>
              <span className="hidden sm:inline">{phase.label}</span>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  index < currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
