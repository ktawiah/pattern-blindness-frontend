"use client";

import { useEffect, useState } from "react";
import {
  patternTrackingApi,
  type PatternUsageStatsResponse,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Clock,
  Target,
  TrendingDown,
  Loader2,
} from "lucide-react";

interface BlindSpotRadarProps {
  className?: string;
}

export function BlindSpotRadar({ className }: BlindSpotRadarProps) {
  const [stats, setStats] = useState<PatternUsageStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await patternTrackingApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch pattern tracking stats:", err);
        setError("Failed to load blind spot data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error || "No data available"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasBlindSpots =
    stats.decayingPatterns.length > 0 ||
    stats.defaultPatterns.length > 0 ||
    stats.avoidedPatterns.length > 0;

  if (!hasBlindSpots) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Blind Spot Radar
          </CardTitle>
          <CardDescription>
            Track patterns you might be overlooking or over-relying on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              No blind spots detected yet. Keep practicing to build pattern coverage!
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{stats.uniquePatternsPracticed}</span> of{" "}
              {stats.totalPatterns} patterns practiced
            </div>
            <div>
              <span className="font-medium text-foreground">{stats.totalAttempts}</span> total attempts
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Blind Spot Radar
        </CardTitle>
        <CardDescription>
          Patterns you might be overlooking or over-relying on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Coverage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pattern Coverage</span>
            <span className="text-muted-foreground">
              {stats.uniquePatternsPracticed} of {stats.totalPatterns}
            </span>
          </div>
          <Progress
            value={(stats.uniquePatternsPracticed / stats.totalPatterns) * 100}
          />
        </div>

        {/* Decaying Patterns */}
        {stats.decayingPatterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Decaying Skills
              <Badge variant="secondary" className="text-xs">
                {stats.decayingPatterns.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {stats.decayingPatterns.slice(0, 3).map((pattern) => (
                <div
                  key={pattern.patternId}
                  className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <span className="font-medium text-sm">{pattern.patternName}</span>
                    <p className="text-xs text-muted-foreground">
                      Last practiced {pattern.daysSinceLastUse} days ago
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {Math.round(pattern.successRate * 100)}% success
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Patterns (Over-reliance) */}
        {stats.defaultPatterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Possible Over-reliance
              <Badge variant="secondary" className="text-xs">
                {stats.defaultPatterns.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {stats.defaultPatterns.slice(0, 3).map((pattern) => (
                <div
                  key={pattern.patternId}
                  className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                >
                  <div>
                    <span className="font-medium text-sm">{pattern.patternName}</span>
                    <p className="text-xs text-muted-foreground">
                      Chosen {pattern.timesChosen}x ({Math.round(pattern.percentageOfTotal)}% of attempts)
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {Math.round(pattern.successRate * 100)}% success
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avoided Patterns */}
        {stats.avoidedPatterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Avoided Patterns
              <Badge variant="secondary" className="text-xs">
                {stats.avoidedPatterns.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {stats.avoidedPatterns.slice(0, 3).map((pattern) => (
                <div
                  key={pattern.patternId}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <div>
                    <span className="font-medium text-sm">{pattern.patternName}</span>
                    <p className="text-xs text-muted-foreground">
                      Correct answer {pattern.timesCorrectAnswer}x, you chose it {pattern.timesUserChoseIt}x
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
