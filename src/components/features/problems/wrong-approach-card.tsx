"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { WrongApproach } from "@/types";
import { cn } from "@/lib/utils";

interface WrongApproachCardProps {
  approach: WrongApproach;
  isViewed: boolean;
  onView: () => void;
  className?: string;
}

export function WrongApproachCard({
  approach,
  isViewed,
  onView,
  className,
}: WrongApproachCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReveal = () => {
    if (!isViewed) {
      onView();
    }
    setIsExpanded(true);
  };

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Common Wrong Approach</CardTitle>
            <CardDescription className="text-sm mt-1">
              {isExpanded
                ? "Understanding why this fails helps you avoid it"
                : "Click to reveal a common mistake"}
            </CardDescription>
          </div>
          {isViewed && (
            <Badge variant="outline" className="text-xs">
              Viewed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isExpanded ? (
          <Button
            onClick={handleReveal}
            variant="outline"
            className="w-full"
            aria-expanded={isExpanded}
          >
            Reveal Wrong Approach
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertTitle className="font-semibold">The Approach</AlertTitle>
              <AlertDescription className="mt-2">
                {approach.description}
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTitle className="font-semibold">Why It Fails</AlertTitle>
              <AlertDescription className="mt-2">
                {approach.whyItFails}
              </AlertDescription>
            </Alert>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-1">Common Mistake</p>
              <p className="text-sm text-muted-foreground">
                {approach.commonMistake}
              </p>
            </div>

            {(approach.timeComplexity || approach.spaceComplexity) && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {approach.timeComplexity && (
                  <span>Time: {approach.timeComplexity}</span>
                )}
                {approach.spaceComplexity && (
                  <span>Space: {approach.spaceComplexity}</span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
