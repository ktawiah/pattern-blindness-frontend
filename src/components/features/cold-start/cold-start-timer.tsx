"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ColdStartTimerProps {
  timeLeft: number;
  totalDuration: number;
  className?: string;
}

export function ColdStartTimer({
  timeLeft,
  totalDuration,
  className,
}: ColdStartTimerProps) {
  const percentComplete = ((totalDuration - timeLeft) / totalDuration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Color changes as time runs out
  const getTimeColor = () => {
    if (timeLeft <= 10) return "text-red-500 dark:text-red-400";
    if (timeLeft <= 30) return "text-yellow-500 dark:text-yellow-400";
    return "text-foreground";
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Time to think</p>
        <div
          className={cn(
            "text-5xl font-mono font-bold tabular-nums transition-colors",
            getTimeColor(),
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
      </div>
      <Progress value={percentComplete} className="w-full max-w-xs h-2" />
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Use this time to think through the problem. No hints available until the
        timer completes.
      </p>
    </div>
  );
}
