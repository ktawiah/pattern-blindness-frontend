"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { attemptApi } from "@/lib/api";
import type { AttemptResponseDto } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/shared/header";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Timer,
  Brain,
  ArrowRight,
  History,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterStatus = "all" | "correct" | "incorrect" | "in-progress";

function getStatusIcon(attempt: AttemptResponseDto) {
  if (attempt.status === "Solved") {
    return attempt.isPatternCorrect ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  }
  if (attempt.status === "GaveUp" || attempt.status === "TimedOut") {
    return <XCircle className="h-5 w-5 text-gray-400" />;
  }
  return <Clock className="h-5 w-5 text-yellow-600" />;
}

function getStatusBadge(attempt: AttemptResponseDto) {
  if (attempt.status === "Solved") {
    return attempt.isPatternCorrect ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
        Correct
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
        Incorrect
      </Badge>
    );
  }
  if (attempt.status === "GaveUp") {
    return (
      <Badge variant="secondary" className="text-gray-600">
        Given Up
      </Badge>
    );
  }
  if (attempt.status === "TimedOut") {
    return (
      <Badge variant="secondary" className="text-gray-600">
        Timed Out
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
      In Progress
    </Badge>
  );
}

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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptResponseDto[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<
    AttemptResponseDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/history");
    }
  }, [user, authLoading, router]);

  const fetchAttempts = async () => {
    if (!user) return;

    try {
      const data = await attemptApi.getAll();
      // Sort by most recent first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
      setAttempts(sorted);
      setFilteredAttempts(sorted);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
      setError("Failed to load practice history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAttempts();
    }
  }, [user]);

  // Refresh history when signaled from other pages (e.g., after abandoning an attempt)
  useEffect(() => {
    const handleRefresh = () => {
      if (sessionStorage.getItem('refreshHistory') === 'true') {
        sessionStorage.removeItem('refreshHistory');
        fetchAttempts();
      }
    };

    // Check on mount
    handleRefresh();

    // Also listen for focus event
    window.addEventListener('focus', handleRefresh);
    
    return () => {
      window.removeEventListener('focus', handleRefresh);
    };
  }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredAttempts(attempts);
      return;
    }

    const filtered = attempts.filter((attempt) => {
      if (statusFilter === "correct") {
        return attempt.status === "Solved" && attempt.isPatternCorrect;
      }
      if (statusFilter === "incorrect") {
        return (
          (attempt.status === "Solved" && !attempt.isPatternCorrect) ||
          attempt.status === "GaveUp" ||
          attempt.status === "TimedOut"
        );
      }
      if (statusFilter === "in-progress") {
        return (
          attempt.status === "InProgress" ||
          attempt.status === "ColdStartCompleted"
        );
      }
      return true;
    });
    setFilteredAttempts(filtered);
  }, [statusFilter, attempts]);

  // Calculate stats
  const stats = {
    total: attempts.length,
    completed: attempts.filter((a) => a.status === "Solved").length,
    correct: attempts.filter((a) => a.status === "Solved" && a.isPatternCorrect)
      .length,
    avgTime:
      attempts.filter((a) => a.totalTimeSeconds).length > 0
        ? Math.round(
            attempts
              .filter((a) => a.totalTimeSeconds)
              .reduce((sum, a) => sum + (a.totalTimeSeconds || 0), 0) /
              attempts.filter((a) => a.totalTimeSeconds).length,
          )
        : 0,
  };

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice History</h1>
          <p className="text-muted-foreground">
            Review your past attempts and track your progress
          </p>
        </div>

        {attempts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                No practice history
              </h2>
              <p className="text-muted-foreground mb-6">
                Start practicing to build your history
              </p>
              <Button asChild>
                <Link href="/practice">
                  Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Attempts
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed > 0
                      ? Math.round((stats.correct / stats.completed) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold">
                    {formatDuration(stats.avgTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as FilterStatus)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attempts</SelectItem>
                  <SelectItem value="correct">Correct Only</SelectItem>
                  <SelectItem value="incorrect">Incorrect Only</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filteredAttempts.length} attempt
                {filteredAttempts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Attempts List */}
            <div className="space-y-4">
              {filteredAttempts.map((attempt) => (
                <Card
                  key={attempt.id}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Status Icon */}
                      <div className="shrink-0">{getStatusIcon(attempt)}</div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {attempt.problemTitle}
                          </h3>
                          {getStatusBadge(attempt)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(attempt.startedAt).toLocaleDateString()}
                          </span>
                          {attempt.totalTimeSeconds && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3.5 w-3.5" />
                              {formatDuration(attempt.totalTimeSeconds)}
                            </span>
                          )}
                          {attempt.confidence && (
                            <span className="flex items-center gap-1">
                              <Brain className="h-3.5 w-3.5" />
                              {getConfidenceLabel(attempt.confidence)}
                            </span>
                          )}
                        </div>

                        {/* Cold Start Details */}
                        {attempt.coldStart && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-1">
                              Selected: {attempt.coldStart.chosenPatternName}
                            </div>
                            {attempt.coldStart.identifiedSignals && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                Notes: {attempt.coldStart.identifiedSignals}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {attempt.status !== "Solved" &&
                        attempt.status !== "GaveUp" &&
                        attempt.status !== "TimedOut" ? (
                          // In-progress attempt - can continue only for legacy problems
                          attempt.problemId && attempt.problemId !== "00000000-0000-0000-0000-000000000000" ? (
                            <Button asChild size="sm">
                              <Link href={`/practice/${attempt.problemId}`}>
                                Continue
                              </Link>
                            </Button>
                          ) : (
                            <Button disabled size="sm">
                              In Progress
                            </Button>
                          )
                        ) : (
                          // Completed/abandoned attempt - show try again (go back to practice page)
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/practice">
                              Try Again
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
