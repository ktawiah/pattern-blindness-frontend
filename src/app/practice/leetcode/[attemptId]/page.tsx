"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/shared";
import {
  leetcodeApi,
  reflectionApi,
  type CachedProblemResponse,
  type ProblemAnalysisResponse,
  type ReflectionResponse,
} from "@/lib/api";
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
  Loader2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
} from "lucide-react";

type PracticePhase =
  | "loading"
  | "reading"
  | "thinking"
  | "coding-handoff"
  | "return-gate"
  | "reveal"
  | "reflection";

type ApproachOutcome = "Worked" | "PartiallyWorked" | "Failed";
type FailureReason =
  | "WrongInvariant"
  | "EdgeCase"
  | "TimeComplexity"
  | "ImplementationBug"
  | "SpaceComplexity"
  | "Other";

interface AttemptState {
  attemptId: string;
  problemCacheId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  tags: string[];
}

export default function LeetCodePracticePage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const router = useRouter();
  const [phase, setPhase] = useState<PracticePhase>("loading");
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [analysis, setAnalysis] = useState<ProblemAnalysisResponse | null>(
    null,
  );
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User inputs - Pattern identification
  const [identifiedSignals, setIdentifiedSignals] = useState("");
  const [chosenPattern, setChosenPattern] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(50);

  // User inputs - Approach lock-in (invariant/risk)
  const [keyInvariant, setKeyInvariant] = useState("");
  const [primaryRisk, setPrimaryRisk] = useState("");

  // User inputs - Return gate
  const [outcome, setOutcome] = useState<ApproachOutcome | "">("");
  const [firstFailure, setFirstFailure] = useState<FailureReason | "">("");
  const [switchedApproach, setSwitchedApproach] = useState(false);
  const [switchReason, setSwitchReason] = useState("");

  // Coding handoff timestamp
  const [handoffTime, setHandoffTime] = useState<Date | null>(null);

  // Loading states
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);

  // Load the attempt data
  useEffect(() => {
    async function loadAttempt() {
      try {
        // Get the attempt from session storage (set by practice page)
        const storedAttempt = sessionStorage.getItem(`attempt-${attemptId}`);
        if (storedAttempt) {
          setAttempt(JSON.parse(storedAttempt));
          setPhase("reading");
          return;
        }

        // If not in session, we need to refetch
        // For now, redirect back to practice
        setError("Attempt not found. Please start a new practice session.");
      } catch (err) {
        console.error("Failed to load attempt:", err);
        setError("Failed to load practice session.");
      }
    }

    loadAttempt();
  }, [attemptId]);

  // Handle moving to thinking phase
  const handleStartThinking = () => {
    setPhase("thinking");
  };

  // Handle submitting cold start - moves to coding handoff
  const handleSubmitColdStart = async () => {
    if (!attempt) return;

    if (!identifiedSignals.trim()) {
      setError("Please describe the signals you identified.");
      return;
    }
    if (!chosenPattern.trim()) {
      setError("Please specify what pattern you think applies.");
      return;
    }
    if (!keyInvariant.trim()) {
      setError("Please describe the key invariant for your approach.");
      return;
    }
    if (!primaryRisk.trim()) {
      setError("Please describe the primary risk of your approach.");
      return;
    }

    setError(null);
    setHandoffTime(new Date());
    setPhase("coding-handoff");
  };

  // Handle returning from coding
  const handleReturnFromCoding = () => {
    setPhase("return-gate");
  };

  // Handle submitting return gate and getting analysis
  const handleSubmitReturnGate = async () => {
    if (!attempt) return;

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

    setIsLoadingAnalysis(true);
    setError(null);

    try {
      // For LeetCode problems, we skip cold start submission (which requires GUID pattern IDs)
      // and go directly to analysis. The reflection step uses free-text pattern names.

      // Get the analysis for this problem
      const analysisResult = await leetcodeApi.analyzeProblem(
        attempt.titleSlug,
      );
      setAnalysis(analysisResult);
      setPhase("reveal");
    } catch (err) {
      console.error("Failed to analyze problem:", err);
      // Check if it's a quota/service unavailable error
      if (
        err instanceof Error &&
        (err.message.includes("503") || err.message.includes("429"))
      ) {
        setError(
          "OpenAI API quota exceeded. Please add credits to your OpenAI account or contact the administrator.",
        );
      } else {
        setError("Failed to get problem analysis. Please try again.");
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Handle generating reflection
  const handleGenerateReflection = async () => {
    if (!attempt) return;

    setIsGeneratingReflection(true);
    setError(null);

    try {
      const reflectionResult = await reflectionApi.generate(attemptId, {
        chosenPattern,
        identifiedSignals,
        confidenceLevel,
      });
      setReflection(reflectionResult);
      setPhase("reflection");
    } catch (err) {
      console.error("Failed to generate reflection:", err);
      // Check if it's a quota/service unavailable error
      if (
        err instanceof Error &&
        (err.message.includes("503") || err.message.includes("429"))
      ) {
        setError(
          "OpenAI API quota exceeded. Please add credits to your OpenAI account or contact the administrator.",
        );
      } else {
        setError("Failed to generate reflection. Please try again.");
      }
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Parse JSON arrays from analysis
  const parseKeySignals = (
    jsonStr: string,
  ): Array<{
    signal: string;
    explanation: string;
    indicatesPattern: string;
  }> => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const parseCommonMistakes = (
    jsonStr: string,
  ): Array<{ mistake: string; whyItFails: string; betterApproach: string }> => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading practice session...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => router.push("/practice")}>
                  Back to Practice
                </Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Problem Header */}
          {attempt && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">{attempt.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(attempt.difficulty)}>
                    {attempt.difficulty}
                  </Badge>
                  <a
                    href={`https://leetcode.com/problems/${attempt.titleSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {attempt.tags.slice(0, 6).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Phase Progress */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={phase === "reading" ? "default" : "secondary"}>
                1. Read
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "thinking" ? "default" : "secondary"}>
                2. Commit
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "coding-handoff" ? "default" : "secondary"}>
                3. Code
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "return-gate" ? "default" : "secondary"}>
                4. Report
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "reveal" ? "default" : "secondary"}>
                5. Reveal
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "reflection" ? "default" : "secondary"}>
                6. Reflect
              </Badge>
            </div>
          </div>

          {/* Reading Phase */}
          {phase === "reading" && attempt && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Problem Description
                  </CardTitle>
                  <CardDescription>
                    Read the problem carefully. Pay attention to constraints and
                    examples.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: attempt.content }}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleStartThinking}>
                  I&apos;ve Read the Problem
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Thinking Phase */}
          {phase === "thinking" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Pattern Recognition
                  </CardTitle>
                  <CardDescription>
                    Before seeing the solution, identify what patterns you think
                    apply.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signals">
                      What signals/keywords do you see? What hints at the
                      approach?
                    </Label>
                    <Textarea
                      id="signals"
                      placeholder="e.g., 'sorted array' suggests binary search, 'subarray sum' suggests sliding window or prefix sum..."
                      value={identifiedSignals}
                      onChange={(e) => setIdentifiedSignals(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pattern">
                      What pattern do you think solves this problem?
                    </Label>
                    <Textarea
                      id="pattern"
                      placeholder="e.g., Two Pointers, Binary Search, DFS, Dynamic Programming..."
                      value={chosenPattern}
                      onChange={(e) => setChosenPattern(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>How confident are you? ({confidenceLevel}%)</Label>
                    <Slider
                      value={[confidenceLevel]}
                      onValueChange={(value) => setConfidenceLevel(value[0])}
                      max={100}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Guessing</span>
                      <span>Somewhat Sure</span>
                      <span>Very Confident</span>
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <strong>Lock in your approach:</strong> Before coding, commit to what must remain true and where this could fail.
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invariant">
                        Key Invariant: What must remain true throughout your solution?
                      </Label>
                      <Textarea
                        id="invariant"
                        placeholder="e.g., 'Left pointer always points to a smaller element than right pointer', 'Prefix sum array maintains cumulative totals'..."
                        value={keyInvariant}
                        onChange={(e) => setKeyInvariant(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="risk">
                        Primary Risk: Where could this approach fail?
                      </Label>
                      <Textarea
                        id="risk"
                        placeholder="e.g., 'Edge case with empty array', 'Time limit exceeded if nested loops needed', 'Off-by-one error at boundaries'..."
                        value={primaryRisk}
                        onChange={(e) => setPrimaryRisk(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("reading")}>
                  Back to Problem
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmitColdStart}
                  disabled={!identifiedSignals.trim() || !chosenPattern.trim() || !keyInvariant.trim() || !primaryRisk.trim()}
                >
                  Lock In & Go Code
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Coding Handoff Phase */}
          {phase === "coding-handoff" && attempt && (
            <div className="space-y-6">
              <Card className="border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Target className="h-6 w-6 text-primary" />
                    Testing Your Hypothesis
                  </CardTitle>
                  <CardDescription className="text-base">
                    You&apos;ve committed to an approach. Now go prove it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Your hypothesis:</span>
                      <p className="font-medium">{chosenPattern} should work</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Because:</span>
                      <p className="text-sm">{identifiedSignals}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Key invariant to maintain:</span>
                      <p className="text-sm">{keyInvariant}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Watch out for:</span>
                      <p className="text-sm">{primaryRisk}</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">
                      Open LeetCode and implement your solution.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      When you&apos;re done (success or failure), come back and report what happened.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://leetcode.com/problems/${attempt.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="lg">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open LeetCode
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handleReturnFromCoding}
                    >
                      I&apos;m Back - Report Results
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Return Gate Phase */}
          {phase === "return-gate" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Report Your Results
                  </CardTitle>
                  <CardDescription>
                    Tell us how your approach worked so we can give you targeted feedback.
                  </CardDescription>
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
                            Passed all test cases with the approach I committed to
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

                  {/* What broke first - only show if PartiallyWorked or Failed */}
                  {(outcome === "PartiallyWorked" || outcome === "Failed") && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
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
                    <p className="text-sm text-muted-foreground">
                      It&apos;s okay if you did - we want to understand your thinking process.
                    </p>
                  </div>

                  {/* Switch reason - only show if switched */}
                  {switchedApproach && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label htmlFor="switchReason">What made you switch?</Label>
                      <Textarea
                        id="switchReason"
                        placeholder="e.g., 'Realized sliding window wouldn't handle negative numbers', 'Got stuck after 15 minutes and tried a different approach'..."
                        value={switchReason}
                        onChange={(e) => setSwitchReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setPhase("coding-handoff")}>
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmitReturnGate}
                  disabled={isLoadingAnalysis || !outcome}
                >
                  {isLoadingAnalysis ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      See Analysis
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Reveal Phase */}
          {phase === "reveal" && analysis && (
            <div className="space-y-6">
              {/* Your Approach & Results */}
              <Card className={outcome === "Worked" ? "border-green-500" : outcome === "Failed" ? "border-red-500" : "border-yellow-500"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {outcome === "Worked" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : outcome === "Failed" ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    Your Approach: {outcome === "Worked" ? "Success!" : outcome === "PartiallyWorked" ? "Partial Success" : "Didn't Work"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Pattern: </span>
                      <p className="font-medium">{chosenPattern}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Confidence: </span>
                      <p className="font-medium">{confidenceLevel}%</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Signals identified: </span>
                    <p className="text-sm">{identifiedSignals}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Key invariant: </span>
                    <p className="text-sm">{keyInvariant}</p>
                  </div>
                  {(outcome === "PartiallyWorked" || outcome === "Failed") && firstFailure && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">What broke: </span>
                      <p className="font-medium text-red-700 dark:text-red-300">
                        {firstFailure === "WrongInvariant" && "Wrong Invariant"}
                        {firstFailure === "EdgeCase" && "Edge Case"}
                        {firstFailure === "TimeComplexity" && "Time Limit Exceeded"}
                        {firstFailure === "SpaceComplexity" && "Memory Limit Exceeded"}
                        {firstFailure === "ImplementationBug" && "Implementation Bug"}
                        {firstFailure === "Other" && "Other Issue"}
                      </p>
                    </div>
                  )}
                  {switchedApproach && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">You switched approaches: </span>
                      <p className="text-sm">{switchReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Correct Patterns */}
              <Card className="border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Correct Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.primaryPatterns.map((pattern) => (
                      <Badge
                        key={pattern}
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {pattern}
                      </Badge>
                    ))}
                    {analysis.secondaryPatterns.map((pattern) => (
                      <Badge key={pattern} variant="outline">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Insight */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Key Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.keyInsight}</p>
                </CardContent>
              </Card>

              {/* Key Signals */}
              <Card>
                <CardHeader>
                  <CardTitle>Signals to Recognize</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parseKeySignals(analysis.keySignals).map((signal, idx) => (
                      <div key={idx} className="border-l-2 border-primary pl-4">
                        <p className="font-medium">{signal.signal}</p>
                        <p className="text-sm text-muted-foreground">
                          {signal.explanation}
                        </p>
                        <p className="text-xs text-primary">
                          Indicates: {signal.indicatesPattern}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Common Mistakes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Common Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parseCommonMistakes(analysis.commonMistakes).map(
                      (mistake, idx) => (
                        <div
                          key={idx}
                          className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg"
                        >
                          <p className="font-medium text-orange-800 dark:text-orange-200">
                            {mistake.mistake}
                          </p>
                          <p className="text-sm mt-1">{mistake.whyItFails}</p>
                          {mistake.betterApproach && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              Better: {mistake.betterApproach}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Complexity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Complexity
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-8">
                  <div>
                    <span className="text-muted-foreground">Time: </span>
                    <span className="font-mono">{analysis.timeComplexity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Space: </span>
                    <span className="font-mono">
                      {analysis.spaceComplexity}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Approach */}
              <Card>
                <CardHeader>
                  <CardTitle>Solution Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis.approachExplanation}</p>
                </CardContent>
              </Card>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleGenerateReflection}
                  disabled={isGeneratingReflection}
                >
                  {isGeneratingReflection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Feedback...
                    </>
                  ) : (
                    <>
                      Get Personalized Feedback
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Reflection Phase */}
          {phase === "reflection" && reflection && (
            <div className="space-y-6">
              <Card
                className={
                  reflection.isCorrectPattern
                    ? "border-green-500"
                    : "border-orange-500"
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {reflection.isCorrectPattern ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                    )}
                    {reflection.isCorrectPattern
                      ? "Great Pattern Recognition!"
                      : "Keep Practicing!"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{reflection.feedback}</p>
                </CardContent>
              </Card>

              {/* What You Got Right */}
              {reflection.correctIdentifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      What You Got Right
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert">
                      {reflection.correctIdentifications}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What You Missed */}
              {reflection.missedSignals && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">
                      Signals to Notice Next Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert">
                      {reflection.missedSignals}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pattern Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Pattern Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{reflection.patternTips}</p>
                </CardContent>
              </Card>

              {/* Confidence Calibration */}
              <Card>
                <CardHeader>
                  <CardTitle>Confidence Calibration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{reflection.confidenceCalibration}</p>
                </CardContent>
              </Card>

              {/* Next Time Advice */}
              <Card className="bg-primary/5 border-primary">
                <CardHeader>
                  <CardTitle>Advice for Next Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{reflection.nextTimeAdvice}</p>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={() => router.push("/practice")}>
                  Practice Another Problem
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
