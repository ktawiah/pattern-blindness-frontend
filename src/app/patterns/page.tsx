"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { patternApi } from "@/lib/api";
import type { PatternResponse } from "@/types";
import {
  getCategoryLabel,
  getCategoryDifficulty,
  getCategoryAlgorithmType,
  CATEGORY_COMPLEXITY_ORDER,
  type PatternDifficulty,
  type AlgorithmType,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/shared/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Zap,
  Flame,
} from "lucide-react";

// View mode for patterns display
type ViewMode = "difficulty" | "type" | "category";

// Empty state component
function EmptyState() {
  return (
    <Card>
      <CardContent className="pt-6 text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No patterns found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search query
        </p>
      </CardContent>
    </Card>
  );
}

// Pattern card component
interface PatternCardProps {
  pattern: PatternResponse;
  showDifficulty?: boolean;
}

function PatternCard({ pattern, showDifficulty = false }: PatternCardProps) {
  const difficulty = getCategoryDifficulty(pattern.category);

  return (
    <Link href={`/patterns/${pattern.id}`}>
      <Card className="h-full hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{pattern.name}</CardTitle>
            {showDifficulty && (
              <Badge className={`shrink-0 text-xs ${DIFFICULTY_BADGE_COLORS[difficulty]}`}>
                {difficulty}
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">
            {pattern.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Category badge */}
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(pattern.category)}
            </Badge>

            {/* Trigger signals */}
            {pattern.triggerSignals.length > 0 && (
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {pattern.triggerSignals.slice(0, 2).join(", ")}
                  {pattern.triggerSignals.length > 2 && "..."}
                </div>
              </div>
            )}

            {/* Common mistakes */}
            {pattern.commonMistakes.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  {pattern.commonMistakes.length} common mistakes
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <span className="text-sm text-primary flex items-center gap-1">
                Learn more <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Difficulty badge colors
const DIFFICULTY_BADGE_COLORS: Record<PatternDifficulty, string> = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Difficulty icons
const DIFFICULTY_ICONS: Record<PatternDifficulty, React.ReactNode> = {
  Beginner: <GraduationCap className="h-5 w-5 text-green-600" />,
  Intermediate: <Zap className="h-5 w-5 text-yellow-600" />,
  Advanced: <Flame className="h-5 w-5 text-red-600" />,
};

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternResponse[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<PatternResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("difficulty");

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const data = await patternApi.getAll();
        setPatterns(data);
        setFilteredPatterns(data);
      } catch (err) {
        console.error("Failed to fetch patterns:", err);
        setError("Failed to load patterns");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPatterns();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatterns(patterns);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patterns.filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        getCategoryLabel(pattern.category).toLowerCase().includes(query),
    );
    setFilteredPatterns(filtered);
  }, [searchQuery, patterns]);

  // Group patterns by difficulty level
  const patternsByDifficulty = filteredPatterns.reduce(
    (acc, pattern) => {
      const difficulty = getCategoryDifficulty(pattern.category);
      if (!acc[difficulty]) {
        acc[difficulty] = [];
      }
      acc[difficulty].push(pattern);
      return acc;
    },
    {} as Record<PatternDifficulty, PatternResponse[]>,
  );

  // Group patterns by algorithm type (Linear/Non-Linear)
  const patternsByAlgorithmType = filteredPatterns.reduce(
    (acc, pattern) => {
      const type = getCategoryAlgorithmType(pattern.category);
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(pattern);
      return acc;
    },
    {} as Record<AlgorithmType, PatternResponse[]>,
  );

  // Group patterns by category (legacy view)
  const patternsByCategory = filteredPatterns.reduce(
    (acc, pattern) => {
      const category = getCategoryLabel(pattern.category);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(pattern);
      return acc;
    },
    {} as Record<string, PatternResponse[]>,
  );

  // Sort patterns within a group by category complexity
  const sortPatterns = (patterns: PatternResponse[]) => {
    return [...patterns].sort((a, b) => {
      const orderA = CATEGORY_COMPLEXITY_ORDER[a.category] ?? 999;
      const orderB = CATEGORY_COMPLEXITY_ORDER[b.category] ?? 999;
      return orderA - orderB;
    });
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold mb-2">Pattern Library</h1>
          <p className="text-muted-foreground">
            Master these algorithmic patterns to recognize solutions faster
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mb-6">
          <TabsList>
            <TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          {/* By Difficulty View */}
          <TabsContent value="difficulty" className="mt-6">
            {filteredPatterns.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {(["Beginner", "Intermediate", "Advanced"] as PatternDifficulty[]).map((difficulty) => {
                  const difficultyPatterns = patternsByDifficulty[difficulty] || [];
                  if (difficultyPatterns.length === 0) return null;

                  return (
                    <div key={difficulty}>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {DIFFICULTY_ICONS[difficulty]}
                        {difficulty}
                        <Badge className={`ml-2 ${DIFFICULTY_BADGE_COLORS[difficulty]}`}>
                          {difficultyPatterns.length}
                        </Badge>
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortPatterns(difficultyPatterns).map((pattern) => (
                          <PatternCard key={pattern.id} pattern={pattern} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* By Algorithm Type View */}
          <TabsContent value="type" className="mt-6">
            {filteredPatterns.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {(["Linear", "Non-Linear"] as AlgorithmType[]).map((type) => {
                  const typePatterns = patternsByAlgorithmType[type] || [];
                  if (typePatterns.length === 0) return null;

                  return (
                    <div key={type}>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {type} Algorithms
                        <Badge variant="secondary" className="ml-2">
                          {typePatterns.length}
                        </Badge>
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {type === "Linear"
                          ? "Sequential and array-based data structures and techniques"
                          : "Hierarchical, graph-based, and recursive structures"
                        }
                      </p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortPatterns(typePatterns).map((pattern) => (
                          <PatternCard key={pattern.id} pattern={pattern} showDifficulty />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* By Category View (legacy) */}
          <TabsContent value="category" className="mt-6">
            {Object.keys(patternsByCategory).length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {Object.entries(patternsByCategory)
                  .sort(([a], [b]) => {
                    const orderA = CATEGORY_COMPLEXITY_ORDER[a] ?? 999;
                    const orderB = CATEGORY_COMPLEXITY_ORDER[b] ?? 999;
                    return orderA - orderB;
                  })
                  .map(([category, categoryPatterns]) => (
                    <div key={category}>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {category}
                        <Badge variant="secondary" className="ml-2">
                          {categoryPatterns.length}
                        </Badge>
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPatterns
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((pattern) => (
                            <PatternCard key={pattern.id} pattern={pattern} showDifficulty />
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
