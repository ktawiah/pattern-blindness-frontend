"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/shared";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import {
  patternApi,
  problemApi,
  leetcodeApi,
  type LeetCodeProblem,
} from "@/lib/api";
import type { PatternResponse, ProblemBriefResponse } from "@/types";
import { getDifficultyLabel, getCategoryLabel } from "@/types";
import {
  Search,
  ExternalLink,
  Database,
  Globe,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function PracticePage() {
  const router = useRouter();
  const [patterns, setPatterns] = useState<PatternResponse[]>([]);
  const [problems, setProblems] = useState<ProblemBriefResponse[]>([]);
  const [leetcodeProblems, setLeetcodeProblems] = useState<LeetCodeProblem[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeetcode, setIsLoadingLeetcode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("leetcode"); // Default to LeetCode tab now
  const [startingAttempt, setStartingAttempt] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch local database data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [patternsData, problemsData] = await Promise.all([
          patternApi.getAll(),
          problemApi.getAll(),
        ]);

        setPatterns(patternsData);
        setProblems(problemsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load practice data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Search LeetCode problems when search query changes
  useEffect(() => {
    async function searchLeetcode() {
      if (!debouncedSearchQuery.trim()) {
        // Load default problems if no search
        if (activeTab === "leetcode" && leetcodeProblems.length === 0) {
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

      if (activeTab !== "leetcode") return;

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
  }, [debouncedSearchQuery, activeTab]);

  // Initial load for LeetCode tab
  useEffect(() => {
    if (
      activeTab === "leetcode" &&
      leetcodeProblems.length === 0 &&
      !searchQuery
    ) {
      setIsLoadingLeetcode(true);
      leetcodeApi
        .getProblems(50, 0)
        .then(setLeetcodeProblems)
        .catch(console.error)
        .finally(() => setIsLoadingLeetcode(false));
    }
  }, [activeTab]);

  // Start a practice attempt on a LeetCode problem
  const handleStartPractice = useCallback(
    async (titleSlug: string) => {
      setStartingAttempt(titleSlug);
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
        setError("Failed to start practice. Please try again.");
        setStartingAttempt(null);
      }
    },
    [router],
  );

  // Filter patterns by selected category
  const filteredPatterns =
    selectedCategory !== null
      ? patterns.filter((p) => p.category === selectedCategory)
      : patterns;

  // Get unique categories
  const categories = Array.from(new Set(patterns.map((p) => p.category)));

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

          {/* Tabs for Local vs LeetCode */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="leetcode" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                LeetCode Problems
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Legacy Problems
              </TabsTrigger>
            </TabsList>

            {/* LeetCode Problems Tab (now primary) */}
            <TabsContent value="leetcode" className="mt-6">
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

              {isLoadingLeetcode ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-5 bg-muted rounded w-2/3" />
                      </CardHeader>
                      <CardContent>
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
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <span className="text-muted-foreground">
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
                        </CardHeader>
                        <CardContent className="pt-0">
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
            </TabsContent>

            {/* Local Problems Tab (legacy) */}
            <TabsContent value="local" className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-10 bg-muted rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Category Filter */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">
                      Filter by Category
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          selectedCategory === null ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Categories
                      </Badge>
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={
                            selectedCategory === category
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {getCategoryLabel(category)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Patterns Section */}
                  {filteredPatterns.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-4">Patterns</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {filteredPatterns.map((pattern) => (
                          <Card key={pattern.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                {pattern.name}
                                <Badge variant="secondary" className="text-xs">
                                  {getCategoryLabel(pattern.category)}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="line-clamp-2">
                                {pattern.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1">
                                {pattern.triggerSignals
                                  .slice(0, 3)
                                  .map((signal) => (
                                    <Badge
                                      key={signal}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {signal}
                                    </Badge>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problems List */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                      Legacy Problems ({problems.length})
                    </h2>
                    {problems.length === 0 ? (
                      <Card className="text-center py-12">
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            No legacy problems available. Use the LeetCode tab
                            for the new experience!
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      problems.map((problem) => (
                        <Card
                          key={problem.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="text-lg">
                                  {problem.title}
                                </CardTitle>
                              </div>
                              <Badge
                                className={
                                  DIFFICULTY_COLORS[
                                    getDifficultyLabel(problem.difficulty)
                                  ]
                                }
                              >
                                {getDifficultyLabel(problem.difficulty)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-end">
                              <Link href={`/practice/${problem.id}`}>
                                <Button>Start Practice</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
