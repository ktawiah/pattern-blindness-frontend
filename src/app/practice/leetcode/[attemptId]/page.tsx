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
  | "reveal"
  | "reflection";

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

  // User inputs
  const [identifiedSignals, setIdentifiedSignals] = useState("");
  const [chosenPattern, setChosenPattern] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(50);

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

  // Handle submitting cold start and getting analysis
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

    setIsLoadingAnalysis(true);
    setError(null);

    try {
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
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={phase === "reading" ? "default" : "secondary"}>
                1. Read Problem
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "thinking" ? "default" : "secondary"}>
                2. Identify Patterns
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "reveal" ? "default" : "secondary"}>
                3. Reveal Analysis
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={phase === "reflection" ? "default" : "secondary"}>
                4. Reflection
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
                  disabled={isLoadingAnalysis}
                >
                  {isLoadingAnalysis ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Reveal Analysis
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
              {/* Your Answer */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    Your Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Pattern: </span>
                    {chosenPattern}
                  </div>
                  <div>
                    <span className="font-medium">Signals: </span>
                    {identifiedSignals}
                  </div>
                  <div>
                    <span className="font-medium">Confidence: </span>
                    {confidenceLevel}%
                  </div>
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
