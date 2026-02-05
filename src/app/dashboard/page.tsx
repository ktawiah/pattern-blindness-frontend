"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { attemptApi } from "@/lib/api";
import { useFeaturePhase } from "@/lib/hooks";
import type { AttemptResponseDto, ConfidenceDashboardDto } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/header";
import { BlindSpotRadar } from "@/components/features/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  Lock,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";

function getConfidenceLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Not Confident",
    2: "Slightly Confident",
    3: "Moderately Confident",
    4: "Confident",
    5: "Very Confident",
  };
  return labels[level] || `Level ${level}`;
}

function getCalibrationInsight(dashboard: ConfidenceDashboardDto): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  const totalAttempts = dashboard.stats.reduce(
    (s, c) => s + c.totalAttempts,
    0,
  );
  const totalCorrect = dashboard.stats.reduce(
    (s, c) => s + c.correctAttempts,
    0,
  );

  if (totalAttempts < 5) {
    return {
      label: "Getting Started",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      description: "Complete more problems to see your calibration",
    };
  }

  const overallAccuracy = totalCorrect / totalAttempts;
  const hasOverconfidence = dashboard.overconfidentPatterns.length > 0;
  const hasFragility = dashboard.fragilePatterns.length > 0;

  if (hasOverconfidence && hasFragility) {
    return {
      label: "Mixed",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Some patterns need work on confidence and execution",
    };
  }

  if (hasOverconfidence) {
    return {
      label: "Overconfident",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      description: "Your confidence exceeds your accuracy on some patterns",
    };
  }

  if (hasFragility) {
    return {
      label: "Underconfident",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "You're better than you think!",
    };
  }

  if (overallAccuracy >= 0.8) {
    return {
      label: "Well Calibrated",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Your confidence matches your performance",
    };
  }

  return {
    label: "Developing",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    description: "Keep practicing to improve",
  };
}

// Circular progress component for accuracy display
function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { phase, problemsToNextPhase, completedAttempts, features, isLoading: phaseLoading } = useFeaturePhase();
  const [dashboard, setDashboard] = useState<ConfidenceDashboardDto | null>(null);
  const [attempts, setAttempts] = useState<AttemptResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);
  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch data individually to handle partial failures gracefully
      const [dashboardResult, attemptsResult] = await Promise.allSettled([
        attemptApi.getConfidenceDashboard(),
        attemptApi.getAll(),
      ]);

      // Use data if available, otherwise use empty defaults
      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      }
      if (attemptsResult.status === "fulfilled") {
        setAttempts(attemptsResult.value);
      }

      // Only show error if both requests failed (likely a server issue)
      if (dashboardResult.status === "rejected" && attemptsResult.status === "rejected") {
        console.error("Failed to fetch dashboard data:", dashboardResult.reason, attemptsResult.reason);
        // Don't show error - just show empty state for new users
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      // Don't show error - gracefully degrade to empty state
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Refresh dashboard when signaled from other pages (e.g., after abandoning an attempt)
  useEffect(() => {
    const handleRefresh = () => {
      if (sessionStorage.getItem('refreshDashboard') === 'true') {
        sessionStorage.removeItem('refreshDashboard');
        fetchData();
      }
    };

    // Check on mount
    handleRefresh();

    // Also listen for custom events that might be dispatched
    window.addEventListener('focus', handleRefresh);
    
    return () => {
      window.removeEventListener('focus', handleRefresh);
    };
  }, [user, fetchData]);

  const stats = dashboard
    ? {
        totalAttempts: dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0),
        totalCorrect: dashboard.stats.reduce((s, c) => s + c.correctAttempts, 0),
        accuracy:
          dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0) > 0
            ? (dashboard.stats.reduce((s, c) => s + c.correctAttempts, 0) /
               dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0)) * 100
            : 0,
      }
    : { totalAttempts: 0, totalCorrect: 0, accuracy: 0 };

  const calibration = dashboard
    ? getCalibrationInsight(dashboard)
    : { label: "No Data", color: "text-muted-foreground", bgColor: "bg-muted/50", description: "" };

  // Calculate phase progress
  const phaseThresholds = [5, 15, 30];
  const currentThreshold = phaseThresholds[phase - 1] || 30;
  const previousThreshold = phase > 1 ? phaseThresholds[phase - 2] : 0;
  const phaseProgress = phase >= 4
    ? 100
    : ((completedAttempts - previousThreshold) / (currentThreshold - previousThreshold)) * 100;

  if (authLoading || isLoading || phaseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.email?.split("@")[0]}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your pattern recognition progress and sharpen your skills.
              </p>
            </div>

            {/* Phase Progress Card */}
            <Card className="w-full lg:w-auto min-w-[280px] border-2 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    {phase >= 4 ? (
                      <Trophy className="h-7 w-7 text-primary" />
                    ) : (
                      <Flame className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Phase {phase}</span>
                      {phase < 4 && (
                        <Badge variant="secondary" className="text-xs">
                          {problemsToNextPhase} to next
                        </Badge>
                      )}
                      {phase >= 4 && (
                        <Badge className="text-xs bg-primary">
                          Max Level
                        </Badge>
                      )}
                    </div>
                    <Progress value={phaseProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedAttempts} problems completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {stats.totalAttempts === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Ready to Start?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Begin your pattern recognition journey. Track your progress,
                identify blind spots, and build reliable problem-solving skills.
              </p>
              <Button size="lg" asChild>
                <Link href="/practice">
                  Start Your First Problem <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Accuracy - Featured Card */}
              <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center pt-2">
                  <CircularProgress value={stats.accuracy} />
                </CardContent>
                <div className="px-6 pb-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {stats.totalCorrect} of {stats.totalAttempts} correct
                  </p>
                </div>
              </Card>

              {/* Total Attempts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Total Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.totalAttempts}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    problems practiced
                  </p>
                </CardContent>
              </Card>

              {/* Patterns Learned */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Patterns Mastered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    {dashboard?.stats.filter((s) => s.correctPercentage >= 70).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    with &gt;70% accuracy
                  </p>
                </CardContent>
              </Card>

              {/* Calibration */}
              <Card className={calibration.bgColor}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    Calibration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${calibration.color}`}>
                    {calibration.label}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {calibration.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout for Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Confidence Breakdown */}
              {features.showConfidenceMetrics ? (
                dashboard && dashboard.stats.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Confidence vs Performance
                      </CardTitle>
                      <CardDescription>
                        How well your confidence predicts your actual results
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {dashboard.stats.map((stat) => {
                          const isCalibrated = Math.abs(stat.correctPercentage - (stat.confidence * 20)) < 20;
                          return (
                            <div key={stat.confidence} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">
                                  {getConfidenceLabel(stat.confidence)}
                                </span>
                                <Badge
                                  variant={isCalibrated ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {Math.round(stat.correctPercentage)}% correct
                                </Badge>
                              </div>
                              <div className="flex gap-2 items-center">
                                <Progress
                                  value={stat.correctPercentage}
                                  className="flex-1 h-3"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {stat.correctAttempts} of {stat.totalAttempts} attempts
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                      Confidence Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert className="border-primary/20 bg-primary/5">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        Complete <strong>{problemsToNextPhase} more problem{problemsToNextPhase !== 1 ? "s" : ""}</strong> to unlock
                        confidence vs performance analytics.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {attempts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest practice sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attempts.slice(0, 6).map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {attempt.isPatternCorrect ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            ) : attempt.isPatternCorrect === false ? (
                              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-yellow-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-[200px]">
                                {attempt.problemTitle}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(attempt.startedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {attempt.status === "Solved" && attempt.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {attempt.confidence}/5
                              </Badge>
                            )}
                            {attempt.status !== "Solved" && (
                              <Badge variant="secondary" className="text-xs">
                                {attempt.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pattern Analysis Section - Full Width */}
            {features.showBlindSpots && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Overconfident Patterns */}
                {dashboard && dashboard.overconfidentPatterns.length > 0 && (
                  <Card className="border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Overconfident Patterns
                      </CardTitle>
                      <CardDescription>
                        High confidence but lower accuracy — focus practice here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.overconfidentPatterns.slice(0, 3).map((pattern) => (
                          <div
                            key={pattern.patternId}
                            className="flex items-center justify-between p-4 bg-white dark:bg-background rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{pattern.patternName}</div>
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {pattern.insight}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-orange-600">
                                {Math.round(pattern.wrongPercentage)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                error rate
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fragile Patterns */}
                {dashboard && dashboard.fragilePatterns.length > 0 && (
                  <Card className="border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <Target className="h-5 w-5" />
                        Hidden Strengths
                      </CardTitle>
                      <CardDescription>
                        You&apos;re better than you think on these patterns!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.fragilePatterns.slice(0, 3).map((pattern) => (
                          <div
                            key={pattern.patternId}
                            className="flex items-center justify-between p-4 bg-white dark:bg-background rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{pattern.patternName}</div>
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {pattern.insight}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-blue-600">
                                {Math.round(100 - pattern.wrongPercentage)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                success rate
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Blind Spot Radar */}
            {features.showBlindSpots && <BlindSpotRadar className="w-full" />}

            {/* CTA Card */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Ready for more?</h3>
                      <p className="text-sm text-muted-foreground">
                        Consistent practice builds reliable pattern recognition skills.
                      </p>
                    </div>
                  </div>
                  <Button size="lg" asChild>
                    <Link href="/practice">
                      Continue Practicing <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
