"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Problem } from "@/types";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProblemDisplayProps {
  problem: Problem;
  showSolution?: boolean;
  className?: string;
}

export function ProblemDisplay({
  problem,
  showSolution = false,
  className,
}: ProblemDisplayProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{problem.title}</CardTitle>
            <CardDescription className="mt-1">
              Pattern-based interview problem
            </CardDescription>
          </div>
          <Badge
            className={cn("shrink-0", DIFFICULTY_COLORS[problem.difficulty])}
          >
            {problem.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Problem Description */}
        <div>
          <h3 className="font-semibold mb-2">Problem</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {/* Constraints */}
        {problem.constraints.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {problem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {problem.examples.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Examples</h3>
            <div className="space-y-4">
              {problem.examples.map((example, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2"
                >
                  <div>
                    <span className="text-muted-foreground">Input: </span>
                    <span>{example.input}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Output: </span>
                    <span>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-muted-foreground">
                        Explanation:{" "}
                      </span>
                      <span className="font-sans">{example.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution (conditional) */}
        {showSolution && (
          <>
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Solution Approach</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {problem.solutionApproach}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Solution Code</h3>
              <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                <code className="text-sm">{problem.solutionCode}</code>
              </pre>
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Time Complexity: {problem.timeComplexity}</span>
              <span>Space Complexity: {problem.spaceComplexity}</span>
            </div>
          </>
        )}

        {/* Tags */}
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {problem.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
