"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { attemptApi } from "@/lib/api";
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
import { Header } from "@/components/shared/header";
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
      description: "Complete more problems to see your calibration",
    };
  }

  const overallAccuracy = totalCorrect / totalAttempts;
  const hasOverconfidence = dashboard.overconfidentPatterns.length > 0;
  const hasFragility = dashboard.fragilePatterns.length > 0;

  if (hasOverconfidence && hasFragility) {
    return {
      label: "Mixed Calibration",
      color: "text-yellow-600",
      description: "Some patterns need work on both confidence and execution",
    };
  }

  if (hasOverconfidence) {
    return {
      label: "Overconfident",
      color: "text-orange-600",
      description: "Your confidence exceeds your accuracy on some patterns",
    };
  }

  if (hasFragility) {
    return {
      label: "Underconfident",
      color: "text-blue-600",
      description: "You're better than you think on some patterns!",
    };
  }

  if (overallAccuracy >= 0.8) {
    return {
      label: "Well Calibrated",
      color: "text-green-600",
      description: "Your confidence matches your performance nicely",
    };
  }

  return {
    label: "Developing",
    color: "text-yellow-600",
    description: "Keep practicing to improve pattern recognition",
  };
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<ConfidenceDashboardDto | null>(
    null,
  );
  const [attempts, setAttempts] = useState<AttemptResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [dashboardData, attemptsData] = await Promise.all([
          attemptApi.getConfidenceDashboard(),
          attemptApi.getAll(),
        ]);
        setDashboard(dashboardData);
        setAttempts(attemptsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  // Calculate stats from dashboard data
  const stats = dashboard
    ? {
        totalAttempts: dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0),
        totalCorrect: dashboard.stats.reduce(
          (s, c) => s + c.correctAttempts,
          0,
        ),
        accuracy:
          dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0) > 0
            ? dashboard.stats.reduce((s, c) => s + c.correctAttempts, 0) /
              dashboard.stats.reduce((s, c) => s + c.totalAttempts, 0)
            : 0,
      }
    : { totalAttempts: 0, totalCorrect: 0, accuracy: 0 };

  const calibration = dashboard
    ? getCalibrationInsight(dashboard)
    : { label: "No Data", color: "text-muted-foreground", description: "" };

  if (authLoading || isLoading) {
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Track your pattern recognition progress and confidence calibration
          </p>
        </div>

        {stats.totalAttempts === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No attempts yet</h2>
              <p className="text-muted-foreground mb-6">
                Start practicing to track your progress and build pattern
                recognition skills
              </p>
              <Button asChild>
                <Link href="/practice">
                  Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Attempts
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalAttempts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    problems attempted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Accuracy
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.accuracy * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalCorrect} of {stats.totalAttempts} correct
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Patterns Learned
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboard?.stats.filter((s) => s.correctPercentage >= 70)
                      .length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    with &gt;70% accuracy
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Calibration
                  </CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${calibration.color}`}>
                    {calibration.label}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    confidence vs reality
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Confidence Breakdown */}
            {dashboard && dashboard.stats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Confidence vs Performance
                  </CardTitle>
                  <CardDescription>
                    How well your confidence predicts your actual performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.stats.map((stat) => (
                      <div key={stat.confidence} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {getConfidenceLabel(stat.confidence)}
                          </span>
                          <span className="text-muted-foreground">
                            {stat.totalAttempts} attempts •{" "}
                            {Math.round(stat.correctPercentage)}% correct
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Progress
                            value={stat.correctPercentage}
                            className="flex-1"
                          />
                          <span className="text-xs w-12 text-right">
                            {stat.correctAttempts}/{stat.totalAttempts}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overconfident Patterns */}
            {dashboard && dashboard.overconfidentPatterns.length > 0 && (
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Overconfident Patterns
                  </CardTitle>
                  <CardDescription>
                    You feel confident but make mistakes on these patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.overconfidentPatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {pattern.patternName}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pattern.insight}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600">
                            {Math.round(pattern.wrongPercentage)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            wrong ({pattern.wrongCount}/{pattern.totalAttempts})
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
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Target className="h-5 w-5" />
                    Fragile Patterns
                  </CardTitle>
                  <CardDescription>
                    You&apos;re better than you think! These patterns have
                    inconsistent results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.fragilePatterns.map((pattern) => (
                      <div
                        key={pattern.patternId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {pattern.patternName}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pattern.insight}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600">
                            {Math.round(100 - pattern.wrongPercentage)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            correct (
                            {pattern.totalAttempts - pattern.wrongCount}/
                            {pattern.totalAttempts})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {attempts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your last practice attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attempts.slice(0, 10).map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {attempt.isPatternCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : attempt.isPatternCorrect === false ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <div className="font-medium">
                              {attempt.problemTitle}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(attempt.startedAt).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(attempt.startedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {attempt.status === "Solved"
                              ? `Confidence: ${attempt.confidence}/5`
                              : attempt.status}
                          </div>
                          {attempt.totalTimeSeconds && (
                            <div className="text-xs text-muted-foreground">
                              {Math.round(attempt.totalTimeSeconds / 60)}min
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Ready to practice more?</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent practice builds reliable pattern recognition
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/practice">
                      Continue Practicing{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
