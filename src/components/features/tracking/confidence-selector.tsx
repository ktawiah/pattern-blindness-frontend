"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CONFIDENCE_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ConfidenceSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function ConfidenceSelector({
  value,
  onChange,
  disabled,
  className,
}: ConfidenceSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">
        How confident are you in your approach?
      </Label>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Confidence level"
      >
        {CONFIDENCE_LEVELS.map((level) => (
          <Button
            key={level.value}
            type="button"
            variant={value === level.value ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => onChange(level.value)}
            className={cn(
              "flex-1 min-w-25 flex flex-col items-center gap-1 h-auto py-3",
              value === level.value && "ring-2 ring-primary ring-offset-2",
            )}
            role="radio"
            aria-checked={value === level.value}
          >
            <span className="text-xl" aria-hidden="true">
              {level.emoji}
            </span>
            <span className="text-xs font-medium">{level.label}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {CONFIDENCE_LEVELS.find((l) => l.value === value)?.description}
      </p>
    </div>
  );
}
