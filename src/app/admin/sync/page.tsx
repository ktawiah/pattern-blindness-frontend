"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { leetcodeApi, type LeetCodeSyncResult } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSyncPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<LeetCodeSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [problemCount, setProblemCount] = useState(20);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const syncResult = await leetcodeApi.syncProblems(problemCount);
      setResult(syncResult);
    } catch (err) {
      console.error("Sync failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sync problems from LeetCode",
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Admin: LeetCode Sync</h1>
            <p className="text-muted-foreground mt-2">
              Sync problems from LeetCode to populate the problem database with
              real interview questions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>
                Configure how many problems to fetch from LeetCode&apos;s API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="problemCount" className="text-sm font-medium">
                  Number of problems to sync
                </label>
                <input
                  id="problemCount"
                  type="number"
                  min={1}
                  max={100}
                  value={problemCount}
                  onChange={(e) =>
                    setProblemCount(
                      Math.min(
                        100,
                        Math.max(1, parseInt(e.target.value) || 20),
                      ),
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 100 problems per sync to avoid rate limiting.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Syncing from LeetCode...
                  </>
                ) : (
                  <>🔄 Sync Problems from LeetCode</>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Sync Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ Sync Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.totalFetched}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Fetched
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.newlyCreated}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Newly Created
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Errors:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {result.errors.map((err, idx) => (
                        <li key={idx}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/practice")}
                  >
                    View Problems →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>1. Fetch:</strong> Problems are fetched from
                LeetCode&apos;s GraphQL API with their title, description,
                difficulty, and topic tags.
              </p>
              <p>
                <strong>2. Pattern Detection:</strong> Topic tags like &quot;Two
                Pointers&quot;, &quot;Dynamic Programming&quot;, &quot;Sliding
                Window&quot; are mapped to our pattern categories.
              </p>
              <p>
                <strong>3. Signal Generation:</strong> Based on the identified
                pattern and problem description, relevant signals are generated.
              </p>
              <p>
                <strong>4. Wrong Approaches:</strong> Common wrong approaches
                are added based on the pattern type.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
