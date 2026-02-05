"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Header } from "@/components/shared/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  Target,
  Clock,
  HardDrive,
  Code,
  ExternalLink,
  Brain,
  CheckCircle,
  Zap,
} from "lucide-react";

interface PageProps {
  params: Promise<{ patternId: string }>;
}

export default function PatternDetailPage({ params }: PageProps) {
  const { patternId } = use(params);
  const router = useRouter();
  const [pattern, setPattern] = useState<PatternResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const patternData = await patternApi.getById(patternId);
        setPattern(patternData);
      } catch (err) {
        console.error("Failed to fetch pattern:", err);
        setError("Failed to load pattern details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [patternId]);

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

  if (error || !pattern) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">{error || "Pattern not found"}</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
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
        {/* Back navigation */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patterns
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{pattern.name}</h1>
            <Badge variant="secondary">
              {getCategoryLabel(pattern.category)}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {pattern.description}
          </p>

          {/* Complexity badges */}
          {(pattern.timeComplexity || pattern.spaceComplexity) && (
            <div className="flex gap-4 mt-4">
              {pattern.timeComplexity && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Time:{" "}
                    <code className="bg-muted px-1 rounded">
                      {pattern.timeComplexity}
                    </code>
                  </span>
                </div>
              )}
              {pattern.spaceComplexity && (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Space:{" "}
                    <code className="bg-muted px-1 rounded">
                      {pattern.spaceComplexity}
                    </code>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">When to Use</TabsTrigger>
                <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
                <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* What It Is */}
                {pattern.whatItIs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-500" />
                        What It Is
                      </CardTitle>
                      <CardDescription>
                        Understanding the pattern fundamentals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {pattern.whatItIs}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Why It Works */}
                {pattern.whyItWorks && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Why It Works
                      </CardTitle>
                      <CardDescription>
                        The intuition behind the pattern
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {pattern.whyItWorks}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Common Use Cases */}
                {pattern.commonUseCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Common Use Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {pattern.commonUseCases.map((useCase, index) => (
                          <Badge key={index} variant="outline">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* When to Use Tab */}
              <TabsContent value="usage" className="space-y-6 mt-6">
                {/* When To Use */}
                {pattern.whenToUse && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        When to Use This Pattern
                      </CardTitle>
                      <CardDescription>
                        Problem characteristics that suggest this pattern
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {pattern.whenToUse}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trigger Signals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Trigger Signals
                    </CardTitle>
                    <CardDescription>
                      Quick indicators to recognize this pattern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pattern.triggerSignals.length > 0 ? (
                      <ul className="space-y-3">
                        {pattern.triggerSignals.map((signal, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {signal}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        No trigger signals documented yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Algorithm Tab */}
              <TabsContent value="algorithm" className="space-y-6 mt-6">
                {pattern.pseudoCode && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-cyan-500" />
                        Algorithm
                      </CardTitle>
                      <CardDescription>
                        Step-by-step algorithm description
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {pattern.pseudoCode}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Common Mistakes Tab */}
              <TabsContent value="mistakes" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Common Mistakes
                    </CardTitle>
                    <CardDescription>
                      Pitfalls to avoid when applying this pattern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pattern.commonMistakes.length > 0 ? (
                      <ul className="space-y-3">
                        {pattern.commonMistakes.map((mistake, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg"
                          >
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">
                        No common mistakes documented yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Practice CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <Target className="h-8 w-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Practice This Pattern
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  Apply what you&apos;ve learned with real problems
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/practice">Start Practicing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            {pattern.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ExternalLink className="h-4 w-4" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pattern.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {resource.title}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {resource.type}
                          </Badge>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Problems */}

          </div>
        </div>
      </main>
    </div>
  );
}
