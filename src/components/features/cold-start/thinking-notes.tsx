"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ThinkingNotesProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = `Write down your initial approach...

• What patterns do you recognize?
• What data structures might help?
• What's your first instinct?`;

export function ThinkingNotes({
  value,
  onChange,
  disabled,
  className,
  placeholder = DEFAULT_PLACEHOLDER,
}: ThinkingNotesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="thinking-notes" className="text-sm font-medium">
        Your Initial Thoughts
      </Label>
      <Textarea
        id="thinking-notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-50 resize-none font-mono text-sm"
        aria-describedby="thinking-notes-hint"
      />
      <p id="thinking-notes-hint" className="text-xs text-muted-foreground">
        Writing down your thoughts helps build pattern recognition. These notes
        are saved with your attempt.
      </p>
    </div>
  );
}
