"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { patternApi } from "@/lib/api";
import type { PatternResponse } from "@/types";
import { getCategoryLabel } from "@/types";
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
import {
  Search,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternResponse[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<PatternResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Group patterns by category
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

        {/* Patterns by Category */}
        {Object.keys(patternsByCategory).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No patterns found</h2>
              <p className="text-muted-foreground">
                Try adjusting your search query
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(patternsByCategory).map(
              ([category, categoryPatterns]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {category}
                    <Badge variant="secondary" className="ml-2">
                      {categoryPatterns.length}
                    </Badge>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPatterns.map((pattern) => (
                      <Link key={pattern.id} href={`/patterns/${pattern.id}`}>
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {pattern.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {pattern.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {/* Trigger signals */}
                              {pattern.triggerSignals.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                  <div className="text-sm text-muted-foreground line-clamp-2">
                                    {pattern.triggerSignals
                                      .slice(0, 2)
                                      .join(", ")}
                                    {pattern.triggerSignals.length > 2 && "..."}
                                  </div>
                                </div>
                              )}

                              {/* Common mistakes */}
                              {pattern.commonMistakes.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                  <div className="text-sm text-muted-foreground">
                                    {pattern.commonMistakes.length} common
                                    mistakes
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
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}
