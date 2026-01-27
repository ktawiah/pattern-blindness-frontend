"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dataStructureApi } from "@/lib/api";
import type { DataStructureResponse } from "@/types";
import { getDataStructureCategoryLabel } from "@/types";
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
  Brain,
  Clock,
  Code,
  ExternalLink,
  Target,
  Scale,
  CheckCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ dataStructureId: string }>;
}

export default function DataStructureDetailPage({ params }: PageProps) {
  const { dataStructureId } = use(params);
  const router = useRouter();
  const [dataStructure, setDataStructure] =
    useState<DataStructureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dataStructureApi.getById(dataStructureId);
        setDataStructure(data);
      } catch (err) {
        console.error("Failed to fetch data structure:", err);
        setError("Failed to load data structure details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dataStructureId]);

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

  if (error || !dataStructure) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">
                {error || "Data structure not found"}
              </p>
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
          Back to Data Structures
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{dataStructure.name}</h1>
            <Badge variant="secondary">
              {getDataStructureCategoryLabel(dataStructure.category)}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {dataStructure.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="code">Implementation</TabsTrigger>
                <TabsTrigger value="tradeoffs">Trade-offs</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* What It Is */}
                {dataStructure.whatItIs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-500" />
                        What It Is
                      </CardTitle>
                      <CardDescription>
                        Understanding the data structure fundamentals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {dataStructure.whatItIs}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* When To Use */}
                {dataStructure.whenToUse && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        When to Use
                      </CardTitle>
                      <CardDescription>
                        Ideal scenarios for this data structure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {dataStructure.whenToUse}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Common Use Cases */}
                {dataStructure.commonUseCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Common Use Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {dataStructure.commonUseCases.map((useCase, index) => (
                          <Badge key={index} variant="outline">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Operations Tab */}
              <TabsContent value="operations" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Time Complexity
                    </CardTitle>
                    <CardDescription>
                      Performance characteristics of common operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dataStructure.operations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-medium">
                                Operation
                              </th>
                              <th className="text-left py-3 px-2 font-medium">
                                Time Complexity
                              </th>
                              <th className="text-left py-3 px-2 font-medium hidden md:table-cell">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataStructure.operations.map((op, index) => (
                              <tr
                                key={index}
                                className="border-b last:border-0"
                              >
                                <td className="py-3 px-2 font-medium">
                                  {op.name}
                                </td>
                                <td className="py-3 px-2">
                                  <code className="bg-muted px-2 py-1 rounded text-sm">
                                    {op.timeComplexity}
                                  </code>
                                </td>
                                <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                                  {op.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No operations documented yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Implementation Tab */}
              <TabsContent value="code" className="space-y-6 mt-6">
                {dataStructure.implementation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-cyan-500" />
                        Implementation
                      </CardTitle>
                      <CardDescription>
                        Code examples and implementation details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                        {dataStructure.implementation}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Trade-offs Tab */}
              <TabsContent value="tradeoffs" className="space-y-6 mt-6">
                {dataStructure.tradeoffs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-purple-500" />
                        Trade-offs
                      </CardTitle>
                      <CardDescription>
                        Pros and cons of this data structure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground bg-transparent p-0">
                          {dataStructure.tradeoffs}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Category</div>
                  <Badge variant="secondary">
                    {getDataStructureCategoryLabel(dataStructure.category)}
                  </Badge>
                </div>
                {dataStructure.operations.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Key Operations
                    </div>
                    <div className="space-y-1">
                      {dataStructure.operations.slice(0, 4).map((op, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {op.name}
                          </span>
                          <code className="text-xs bg-muted px-1 rounded">
                            {op.timeComplexity}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            {dataStructure.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ExternalLink className="h-4 w-4" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dataStructure.resources.map((resource, index) => (
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
          </div>
        </div>
      </main>
    </div>
  );
}
