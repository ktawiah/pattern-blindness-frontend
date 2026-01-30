"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/shared";
import { leetcodeApi, profileApi, attemptApi, type LeetCodeProblem, type ActiveAttemptResponse, ApiError } from "@/lib/api";
import {
  Search,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useAuth } from "@/lib/auth/auth-context";

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [leetcodeProblems, setLeetcodeProblems] = useState<LeetCodeProblem[]>(
    [],
  );
  const [isLoadingLeetcode, setIsLoadingLeetcode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startingAttempt, setStartingAttempt] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ActiveAttemptResponse | null>(null);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [isCheckingQualification, setIsCheckingQualification] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle abandon attempt
  const handleAbandonAttempt = useCallback(async () => {
    if (!activeAttempt) return;

    setIsAbandoning(true);
    try {
      await attemptApi.giveUp(activeAttempt.attemptId);
      setActiveAttempt(null);
      setError(null);
    } catch (err) {
      console.error("Failed to abandon attempt:", err);
      setError("Failed to abandon attempt. Please try again.");
    } finally {
      setIsAbandoning(false);
    }
  }, [activeAttempt]);

  // Check qualification on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsCheckingQualification(false);
      return;
    }

    profileApi.checkQualification()
      .then((result) => {
        if (!result.isQualified) {
          router.push("/qualify");
        }
      })
      .catch(() => {
        // If check fails, redirect to qualify (first-time user)
        router.push("/qualify");
      })
      .finally(() => {
        setIsCheckingQualification(false);
      });
  }, [isAuthenticated, router]);

  // Check for active attempt on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    profileApi.getActiveAttempt()
      .then((attempt) => {
        if (attempt) {
          setActiveAttempt(attempt);
        }
      })
      .catch(() => {
        // No active attempt or error - that's fine
      });
  }, [isAuthenticated]);

  // Search LeetCode problems when search query changes
  useEffect(() => {
    async function searchLeetcode() {
      if (!debouncedSearchQuery.trim()) {
        // Load default problems if no search
        if (leetcodeProblems.length === 0) {
          setIsLoadingLeetcode(true);
          try {
            const data = await leetcodeApi.getProblems(50, 0);
            setLeetcodeProblems(data);
          } catch (err) {
            console.error("Failed to fetch LeetCode problems:", err);
          } finally {
            setIsLoadingLeetcode(false);
          }
        }
        return;
      }

      setIsSearching(true);
      try {
        const data = await leetcodeApi.search(debouncedSearchQuery, 30);
        setLeetcodeProblems(data);
      } catch (err) {
        console.error("Failed to search LeetCode problems:", err);
      } finally {
        setIsSearching(false);
      }
    }

    searchLeetcode();
  }, [debouncedSearchQuery]);

  // Initial load for LeetCode problems
  useEffect(() => {
    if (leetcodeProblems.length === 0 && !searchQuery) {
      setIsLoadingLeetcode(true);
      leetcodeApi
        .getProblems(50, 0)
        .then(setLeetcodeProblems)
        .catch(console.error)
        .finally(() => setIsLoadingLeetcode(false));
    }
  }, []);

  // Start a practice attempt on a LeetCode problem
  const handleStartPractice = useCallback(
    async (titleSlug: string) => {
      setStartingAttempt(titleSlug);
      setError(null);
      try {
        const attempt = await leetcodeApi.startAttempt(titleSlug);
        // Store attempt data in sessionStorage for the practice page
        sessionStorage.setItem(
          `attempt-${attempt.attemptId}`,
          JSON.stringify(attempt),
        );
        // Navigate to the practice page with the attempt ID
        router.push(`/practice/leetcode/${attempt.attemptId}`);
      } catch (err) {
        console.error("Failed to start practice:", err);
        // Handle 409 Conflict - active attempt exists
        if (err instanceof ApiError && err.status === 409) {
          // Refresh active attempt state
          try {
            const active = await profileApi.getActiveAttempt();
            if (active) {
              setActiveAttempt(active);
            }
          } catch {
            // Ignore
          }
          setError("You have an open loop! Complete your current problem before starting a new one.");
        } else {
          setError("Failed to start practice. Please try again.");
        }
        setStartingAttempt(null);
      }
    },
    [router],
  );

  // Get difficulty color for LeetCode problems
  const getLeetcodeDifficultyColor = (difficulty: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
            <p className="text-muted-foreground">
              Search any LeetCode problem and practice pattern recognition with
              AI-powered feedback.
            </p>
          </div>

          {/* Active Attempt Banner */}
          {activeAttempt && (
            <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Open Loop Detected</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span>
                    You have an unfinished problem: <strong>{activeAttempt.problemTitle}</strong>.
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/practice/leetcode/${activeAttempt.attemptId}`}
                      className="inline-flex items-center gap-1 font-medium text-amber-800 dark:text-amber-200 underline hover:no-underline"
                    >
                      Continue <ArrowRight className="h-3 w-3" />
                    </Link>
                    <span className="text-amber-500">or</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAbandonAttempt}
                      disabled={isAbandoning}
                      className="text-amber-800 dark:text-amber-200 hover:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/30 h-auto py-1 px-2"
                    >
                      {isAbandoning ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Abandoning...
                        </>
                      ) : (
                        "Abandon"
                      )}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search LeetCode problems (e.g., two sum, binary tree, dynamic programming)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Search by problem name, number, or algorithm tag
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-4">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Problems List */}
          {isCheckingQualification || isLoadingLeetcode ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-4">
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-muted rounded w-16" />
                      <div className="h-5 bg-muted rounded w-20" />
                      <div className="h-5 bg-muted rounded w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? `Found ${leetcodeProblems.length} problems`
                  : `Showing ${leetcodeProblems.length} algorithmic problems`}
              </p>

              <div className="space-y-3">
                {leetcodeProblems.map((problem) => (
                  <Card
                    key={problem.questionId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="text-muted-foreground font-normal">
                              #{problem.frontendId}
                            </span>
                            {problem.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getLeetcodeDifficultyColor(
                              problem.difficulty,
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {problem.acceptanceRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {problem.tags.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{problem.tags.length - 4} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://leetcode.com/problems/${problem.titleSlug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStartPractice(problem.titleSlug)
                            }
                            disabled={startingAttempt === problem.titleSlug}
                          >
                            {startingAttempt === problem.titleSlug ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Practice
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {leetcodeProblems.length === 0 && !isLoadingLeetcode && (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No problems match your search. Try a different query."
                        : "No LeetCode problems loaded yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
