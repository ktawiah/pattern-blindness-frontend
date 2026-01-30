"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dataStructureApi } from "@/lib/api";
import type { DataStructureResponse } from "@/types";
import { getDataStructureCategoryLabel, DATA_STRUCTURE_CATEGORY_ORDER } from "@/types";
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
import { Search, Database, Clock, ArrowRight } from "lucide-react";

export default function DataStructuresPage() {
  const [dataStructures, setDataStructures] = useState<DataStructureResponse[]>(
    [],
  );
  const [filteredDataStructures, setFilteredDataStructures] = useState<
    DataStructureResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchDataStructures() {
      try {
        const data = await dataStructureApi.getAll();
        setDataStructures(data);
        setFilteredDataStructures(data);
      } catch (err) {
        console.error("Failed to fetch data structures:", err);
        setError("Failed to load data structures");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataStructures();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDataStructures(dataStructures);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dataStructures.filter(
      (ds) =>
        ds.name.toLowerCase().includes(query) ||
        ds.description.toLowerCase().includes(query) ||
        getDataStructureCategoryLabel(ds.category)
          .toLowerCase()
          .includes(query),
    );
    setFilteredDataStructures(filtered);
  }, [searchQuery, dataStructures]);

  // Group data structures by category
  const dataStructuresByCategory = filteredDataStructures.reduce(
    (acc, ds) => {
      const category = getDataStructureCategoryLabel(ds.category);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ds);
      return acc;
    },
    {} as Record<string, DataStructureResponse[]>,
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
          <h1 className="text-3xl font-bold mb-2">Data Structures Library</h1>
          <p className="text-muted-foreground">
            Master fundamental data structures and their operations
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search data structures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Data Structures by Category */}
        {Object.keys(dataStructuresByCategory).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                No data structures found
              </h2>
              <p className="text-muted-foreground">
                Try adjusting your search query
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(dataStructuresByCategory)
              .sort(([a], [b]) => {
                const orderA = DATA_STRUCTURE_CATEGORY_ORDER[a] ?? 999;
                const orderB = DATA_STRUCTURE_CATEGORY_ORDER[b] ?? 999;
                return orderA - orderB;
              })
              .map(([category, categoryDataStructures]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {category}
                    <Badge variant="secondary" className="ml-2">
                      {categoryDataStructures.length}
                    </Badge>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryDataStructures
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((ds) => (
                      <Link key={ds.id} href={`/data-structures/${ds.id}`}>
                        <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg">{ds.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {ds.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {/* Operations preview */}
                              {ds.operations.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                  <div className="text-sm text-muted-foreground">
                                    {ds.operations.slice(0, 2).map((op, i) => (
                                      <span key={i}>
                                        {op.name}:{" "}
                                        <code className="text-xs bg-muted px-1 rounded">
                                          {op.timeComplexity}
                                        </code>
                                        {i <
                                          Math.min(
                                            ds.operations.length - 1,
                                            1,
                                          ) && ", "}
                                      </span>
                                    ))}
                                    {ds.operations.length > 2 && "..."}
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
