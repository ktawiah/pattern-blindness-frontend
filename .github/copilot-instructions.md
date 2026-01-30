# Pattern Blindness Frontend - Copilot Instructions

## Project Overview

**Pattern Blindness** is an interview prep platform for engineers with 1-3 YOE who "freeze when seeing a new problem." The app helps break pattern blindness through structured practice.

### MVP Features

1. **Cold Start Commitment** - 90-second forced thinking phase before seeing any hints
2. **Wrong-But-Reasonable Reveal** - Show common mistakes others make
3. **Confidence vs Correctness Tracking** - Track user's confidence calibration over time

### Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4+
- **Components**: shadcn/ui
- **Backend API**: REST API at `http://localhost:8080`

---

## Architecture Guidelines

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── practice/          # Practice session routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature-specific components
│   │   ├── cold-start/    # Cold Start Commitment feature
│   │   ├── patterns/      # Pattern selection & display
│   │   ├── problems/      # Problem display & interaction
│   │   └── tracking/      # Confidence tracking
│   └── shared/            # Shared/common components
├── lib/
│   ├── api/               # API client & fetchers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

### Naming Conventions

- **Files**: kebab-case for files (`cold-start-timer.tsx`)
- **Components**: PascalCase for components (`ColdStartTimer`)
- **Hooks**: camelCase with `use` prefix (`useColdStartTimer`)
- **Types/Interfaces**: PascalCase with descriptive names (`PracticeSession`, `UserAttempt`)

---

## Next.js Best Practices

### App Router & Server Components

- Use Server Components by default for data fetching and static content
- Add `'use client'` directive only when needed (interactivity, hooks, browser APIs)
- Use Route Handlers (`app/api/`) for BFF patterns when needed
- Leverage Server Actions for form mutations

### Data Fetching Patterns

```typescript
// Server Component with fetch
async function ProblemList({ patternId }: { patternId: string }) {
  const problems = await fetch(`${API_BASE}/api/problems?patternId=${patternId}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(res => res.json());

  return <ProblemGrid problems={problems} />;
}

// Client Component with SWR or React Query for real-time data
'use client';
function AttemptTracker({ sessionId }: { sessionId: string }) {
  const { data, error } = useSWR(`/api/attempts/${sessionId}`);
  // ...
}
```

### Route Organization

- Use Route Groups `(groupName)` to organize without affecting URL
- Use parallel routes for complex layouts (sidebar + main content)
- Implement loading.tsx and error.tsx for each route segment

---

## React Best Practices

### Component Patterns

#### Functional Components with Hooks

```typescript
interface ColdStartTimerProps {
  duration: number;
  onComplete: () => void;
}

export function ColdStartTimer({ duration, onComplete }: ColdStartTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="text-4xl font-mono" aria-live="polite">
      {formatTime(timeLeft)}
    </div>
  );
}
```

#### Custom Hooks for Reusable Logic

```typescript
function useColdStartSession(problemId: string) {
  const [phase, setPhase] = useState<"thinking" | "hints" | "solution">(
    "thinking",
  );
  const [userNotes, setUserNotes] = useState("");

  const completeThinking = useCallback(() => {
    setPhase("hints");
  }, []);

  return { phase, userNotes, setUserNotes, completeThinking };
}
```

### State Management

- Use React Context for global UI state (theme, user preferences)
- Use URL state for shareable/bookmarkable state (filters, pagination)
- Use local component state for UI-only state
- Consider Zustand for complex client-side state if needed

### Performance Optimization

- Use `React.memo` for expensive pure components
- Use `useMemo` and `useCallback` for expensive computations and stable references
- Implement virtualization for long lists (react-virtual)
- Use dynamic imports with `next/dynamic` for code splitting

---

## TailwindCSS Guidelines

### Design System

```css
/* Use consistent spacing scale */
p-4, p-6, p-8  /* Padding */
gap-4, gap-6   /* Flex/Grid gaps */
space-y-4      /* Vertical spacing */

/* Use semantic color tokens */
bg-primary, text-primary-foreground
bg-destructive, text-destructive
bg-muted, text-muted-foreground

/* Consistent border radius */
rounded-md, rounded-lg, rounded-xl
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  flex flex-col        /* Mobile: stack vertically */
  md:flex-row          /* Tablet+: horizontal */
  lg:gap-8             /* Desktop: larger gaps */
">
```

### Dark Mode Support

```tsx
// Use dark: prefix for dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Component Styling Pattern

```tsx
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90":
            variant === "default",
          "bg-destructive text-destructive-foreground":
            variant === "destructive",
          "border border-input bg-background hover:bg-accent":
            variant === "outline",
        },
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
```

---

## Accessibility (WCAG 2.2 Level AA)

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order (top to bottom, left to right)
- Visible focus indicators with sufficient contrast
- Support standard keyboard patterns:
  - `Tab` / `Shift+Tab` for navigation
  - `Enter` / `Space` for activation
  - `Escape` for dismissing modals/dialogs
  - Arrow keys for menus, tabs, and lists

### Screen Reader Support

```tsx
// Use semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/practice">Practice</a></li>
  </ul>
</nav>

// Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {timeLeft} seconds remaining
</div>

// Provide accessible names
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Hide decorative elements
<img src="decoration.svg" alt="" aria-hidden="true" />
```

### Form Accessibility

```tsx
<form>
  <div>
    <label htmlFor="email" className="block text-sm font-medium">
      Email address
    </label>
    <input
      type="email"
      id="email"
      name="email"
      required
      aria-describedby="email-hint email-error"
      aria-invalid={errors.email ? "true" : "false"}
      className="mt-1 block w-full rounded-md border"
    />
    <p id="email-hint" className="mt-1 text-sm text-muted-foreground">
      We'll never share your email.
    </p>
    {errors.email && (
      <p
        id="email-error"
        role="alert"
        className="mt-1 text-sm text-destructive"
      >
        {errors.email}
      </p>
    )}
  </div>
</form>
```

### Color and Contrast

- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 for large text and UI components
- Never use color alone to convey information
- Provide text alternatives or icons alongside color indicators

### Motion and Animations

```tsx
// Respect user preferences
<style>
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

// Or in Tailwind
<div className="transition-transform motion-reduce:transition-none">
```

---

## UX Design Principles

### Jobs-to-be-Done for Pattern Blindness

**Primary Job**: "When I see a new coding problem in an interview, I want to recognize the underlying pattern quickly, so I can apply a known solution approach confidently."

**User Context**:

- Engineers with 1-3 years of experience
- Feel anxious when facing unfamiliar problems
- Know common patterns but struggle to recognize them "in the wild"
- Need to build pattern recognition intuition, not just memorize solutions

### User Journey Stages

1. **Cold Start (Forced Thinking)**
   - User sees problem, timer starts
   - No hints available for 90 seconds
   - User must write down initial thoughts
   - Builds muscle memory for independent thinking

2. **Hint Reveal**
   - After timer, "wrong approaches" reveal
   - User compares their thinking to common mistakes
   - Pattern hint becomes available
   - User can choose to see solution or try again

3. **Solution & Reflection**
   - Full solution revealed
   - User rates their confidence
   - System tracks accuracy vs confidence over time
   - Identifies patterns user struggles with

### Design Guidelines

- **Progressive Disclosure**: Don't overwhelm. Reveal hints/solutions gradually.
- **Clear Progress**: Always show where user is in the practice flow.
- **Positive Reinforcement**: Celebrate "good mistakes" (reasonable wrong approaches).
- **Data-Driven Insights**: Show confidence calibration over time.

---

## API Integration

### API Base Configuration

```typescript
// lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
```

### Available Endpoints

```typescript
// Patterns
GET    /api/patterns          // List all patterns
GET    /api/patterns/:id      // Get pattern by ID

// Problems
GET    /api/problems          // List problems (supports ?patternId=)
GET    /api/problems/:id      // Get problem with wrong approaches
GET    /api/problems/:id/solution  // Get solution

// Attempts
POST   /api/attempts          // Create new attempt
GET    /api/attempts/:id      // Get attempt details
PUT    /api/attempts/:id      // Update attempt (confidence, notes)

// Auth
POST   /api/auth/login        // Login
POST   /api/auth/register     // Register
GET    /api/auth/me           // Get current user
```

### Type Definitions

```typescript
// types/api.ts
interface Pattern {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patternId: string;
  wrongApproaches: WrongApproach[];
}

interface WrongApproach {
  id: string;
  description: string;
  whyItFails: string;
  commonMistake: string;
}

interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  thinkingPhaseNotes: string;
  confidenceLevel: number; // 1-5
  wasCorrect: boolean;
  timeSpent: number;
}
```

---

## Performance Optimization

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Image Optimization

```tsx
import Image from "next/image";

<Image
  src="/pattern-diagram.png"
  alt="Two pointer pattern visualization"
  width={600}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurDataURL}
/>;
```

### Code Splitting

```tsx
// Dynamic imports for heavy components
import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("@/components/code-editor"), {
  loading: () => <CodeEditorSkeleton />,
  ssr: false, // Disable SSR for browser-only components
});
```

### Caching Strategy

```typescript
// Static data - cache indefinitely
fetch("/api/patterns", { next: { revalidate: false } });

// Dynamic data - revalidate periodically
fetch("/api/problems", { next: { revalidate: 3600 } });

// User-specific data - no cache
fetch("/api/attempts", { cache: "no-store" });
```

---

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColdStartTimer } from './cold-start-timer';

describe('ColdStartTimer', () => {
  it('calls onComplete when timer reaches zero', async () => {
    const onComplete = vi.fn();
    render(<ColdStartTimer duration={1} onComplete={onComplete} />);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });
  });
});
```

### E2E Tests (Playwright)

```typescript
test("complete practice session flow", async ({ page }) => {
  await page.goto("/practice");
  await page.click('[data-testid="start-session"]');

  // Wait for cold start timer
  await expect(page.locator('[data-testid="thinking-phase"]')).toBeVisible();

  // Fill in notes during thinking phase
  await page.fill('[data-testid="notes-input"]', "My approach...");

  // Wait for timer to complete or skip
  await page.waitForSelector('[data-testid="hints-phase"]');

  // Verify hints are shown
  await expect(page.locator('[data-testid="wrong-approach"]')).toBeVisible();
});
```

---

## Security Best Practices

- Sanitize all user inputs before rendering
- Use `dangerouslySetInnerHTML` sparingly and only with sanitized content
- Implement CSRF protection for mutations
- Store sensitive data in httpOnly cookies, not localStorage
- Use environment variables for API keys and secrets
- Implement rate limiting on form submissions
- Validate and sanitize data on both client and server

---

## Error Handling

### Error Boundaries

```tsx
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
```

### API Error Handling

```typescript
// Consistent error response handling
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

function handleApiError(error: unknown): string {
  if (error instanceof Response) {
    return `Request failed: ${error.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
```

---

## Git Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Keep commits small and focused
- Write descriptive commit messages

Examples:

```
feat: add cold start timer component
fix: resolve timer not stopping on unmount
style: improve mobile responsiveness for problem card
refactor: extract pattern selection logic into custom hook
test: add unit tests for confidence tracking
```

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Linting & Formatting
npm run lint             # ESLint
npm run format           # Prettier

# Type Checking
npm run type-check       # TypeScript check
```

## Agent Instructions

- Never invent APIs, tools, files, or behaviors.
- If required context is missing, stop and request it or use an MCP.
- Use MCPs when external knowledge, state, or verification is needed.
- If an MCP is unavailable, search in the mcp registry and install it globally to use
- Clearly label assumptions, unverified code, and version-dependent logic.
- Prefer correctness over completeness.
