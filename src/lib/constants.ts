// Application-wide constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Cold Start Configuration - Adaptive Durations
export const COLD_START_DURATION_SECONDS = 90; // Legacy default
export const COLD_START_DURATIONS = {
  new: 30, // New users or high performers
  good: 30, // Good accuracy (>70%)
  moderate: 90, // Moderate accuracy (50-70%)
  struggling: 180, // Low accuracy (<50%)
} as const;

export type PerformanceTier = keyof typeof COLD_START_DURATIONS;

// Interview-style prompts for each tier
export const INTERVIEW_PROMPTS = {
  new: "Take 30 seconds to read the problem. What patterns come to mind? Don't rush to code.",
  good: "You have 30 seconds. Walk me through your initial approach. What signals do you see?",
  moderate:
    "I want you to spend 90 seconds thinking before touching the keyboard. What's your hypothesis?",
  struggling:
    "Let's slow down. Take 3 minutes to really understand the problem. What constraints matter most?",
} as const;

// Confidence Levels
export const CONFIDENCE_LEVELS = [
  {
    value: 1,
    label: "Very Unsure",
    emoji: "😰",
    description: "No idea what to do",
  },
  {
    value: 2,
    label: "Somewhat Unsure",
    emoji: "😕",
    description: "Have a vague idea",
  },
  {
    value: 3,
    label: "Neutral",
    emoji: "😐",
    description: "Could go either way",
  },
  {
    value: 4,
    label: "Somewhat Confident",
    emoji: "🙂",
    description: "Pretty sure about approach",
  },
  {
    value: 5,
    label: "Very Confident",
    emoji: "😎",
    description: "Know exactly what to do",
  },
] as const;

// Difficulty colors
export const DIFFICULTY_COLORS = {
  Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
} as const;

// Pattern category icons (using emoji for now)
export const CATEGORY_ICONS = {
  Arrays: "📊",
  Strings: "📝",
  LinkedLists: "🔗",
  Trees: "🌳",
  Graphs: "🕸️",
  DynamicProgramming: "📈",
  Sorting: "🔢",
  Searching: "🔍",
  Recursion: "🔄",
  Other: "📦",
} as const;

// Routes
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  practice: "/practice",
  practiceSession: (problemId: string) => `/practice/${problemId}`,
  patterns: "/patterns",
  pattern: (patternId: string) => `/patterns/${patternId}`,
  history: "/history",
  stats: "/stats",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  authToken: "pattern-blindness-auth-token",
  refreshToken: "pattern-blindness-refresh-token",
  theme: "pattern-blindness-theme",
  currentSession: "pattern-blindness-current-session",
  experienceWarningDismissed: "pattern-blindness-experience-warning-dismissed",
} as const;
