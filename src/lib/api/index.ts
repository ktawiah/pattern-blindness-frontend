import { api } from "./client";
import type {
  PatternResponse,
  DataStructureResponse,
  ProblemResponse,
  ProblemBriefResponse,
  ProblemWithSolutionResponse,
  AttemptResponseDto,
  ConfidenceDashboardDto,
} from "@/types";
import patternsData from "@/data/patterns.json";
import dataStructuresData from "@/data/data-structures.json";

// Pattern API - loads from local JSON instead of backend
export const patternApi = {
  getAll: async () => {
    return Promise.resolve({
      data: patternsData as PatternResponse[],
      status: 200,
    });
  },

  getById: async (id: string) => {
    const pattern = patternsData.find((p: any) => p.id === id) as PatternResponse | undefined;
    if (!pattern) {
      throw new Error(`Pattern with id ${id} not found`);
    }
    return Promise.resolve({
      data: pattern,
      status: 200,
    });
  },

  getByCategory: async (category: string) => {
    const patterns = patternsData.filter((p: any) => p.category === category) as PatternResponse[];
    return Promise.resolve({
      data: patterns,
      status: 200,
    });
  },
};

// Data Structure API - loads from local JSON instead of backend
export const dataStructureApi = {
  getAll: async () => {
    return Promise.resolve({
      data: dataStructuresData as DataStructureResponse[],
      status: 200,
    });
  },

  getById: async (id: string) => {
    const ds = dataStructuresData.find((d: any) => d.id === id) as DataStructureResponse | undefined;
    if (!ds) {
      throw new Error(`Data structure with id ${id} not found`);
    }
    return Promise.resolve({
      data: ds,
      status: 200,
    });
  },

  getByCategory: async (category: number) => {
    // Note: Category filtering might need adjustment based on your actual category structure
    return Promise.resolve({
      data: dataStructuresData as DataStructureResponse[],
      status: 200,
    });
  },

  search: async (query: string) => {
    const lowerQuery = query.toLowerCase();
    const results = dataStructuresData.filter((d: any) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery)
    ) as DataStructureResponse[];
    return Promise.resolve({
      data: results,
      status: 200,
    });
  },
};

// Problem API - matches backend ProblemEndpoints
export const problemApi = {
  getAll: () => api.get<ProblemBriefResponse[]>("/api/problems"),

  getById: (id: string) => api.get<ProblemResponse>(`/api/problems/${id}`),

  getByDifficulty: (difficulty: "Easy" | "Medium" | "Hard") =>
    api.get<ProblemBriefResponse[]>(`/api/problems/difficulty/${difficulty}`),

  getRandom: (difficulty?: "Easy" | "Medium" | "Hard") => {
    const query = difficulty ? `?difficulty=${difficulty}` : "";
    return api.get<ProblemResponse>(`/api/problems/random${query}`);
  },
};

// Cold Start Settings response type
export interface ColdStartSettingsResponse {
  recommendedDurationSeconds: number;
  performanceTier: "new" | "good" | "moderate" | "struggling";
  recentAccuracyPercent: number;
  attemptsSampled: number;
  recommendMultipleHypothesis: boolean;
  interviewPrompt: string;
}

// Return gate types
export type ApproachOutcome = "Worked" | "PartiallyWorked" | "Failed";
export type FailureReason =
  | "WrongInvariant"
  | "EdgeCase"
  | "TimeComplexity"
  | "ImplementationBug"
  | "SpaceComplexity"
  | "Other";

// Attempt API - matches backend AttemptEndpoints
export const attemptApi = {
  start: (problemId: string) =>
    api.post<{ id: string }>("/api/attempts", { problemId }),

  submitColdStart: (
    attemptId: string,
    data: {
      identifiedSignals: string;
      rejectedPatterns?: string;
      chosenPatternId: string;
      secondaryPatternId?: string;
      primaryVsSecondaryReason?: string;
      rejectedPatternId?: string;
      rejectionReason?: string;
      thinkingDurationSeconds: number;
      // NEW: Approach lock-in fields
      keyInvariant?: string;
      primaryRisk?: string;
    },
  ) => api.post(`/api/attempts/${attemptId}/cold-start`, data),

  // Updated with return gate fields
  complete: (
    attemptId: string,
    data: {
      confidence: number;
      outcome: ApproachOutcome;
      firstFailure?: FailureReason;
      switchedApproach: boolean;
      switchReason?: string;
    },
  ) =>
    api.post<ProblemWithSolutionResponse>(
      `/api/attempts/${attemptId}/complete`,
      data,
    ),

  getById: (id: string) => api.get<AttemptResponseDto>(`/api/attempts/${id}`),

  // Get all attempts for the current authenticated user
  getAll: () => api.get<AttemptResponseDto[]>("/api/attempts"),

  getConfidenceDashboard: () =>
    api.get<ConfidenceDashboardDto>("/api/attempts/dashboard"),

  // Get adaptive cold start settings based on user performance
  getColdStartSettings: () =>
    api.get<ColdStartSettingsResponse>("/api/attempts/cold-start-settings"),

  // Give up / abandon the current attempt
  giveUp: (attemptId: string) =>
    api.post<AttemptResponseDto>(`/api/attempts/${attemptId}/give-up`, {}),
};

// ===== USER PROFILE API (Qualification & Phase Gating) =====

export interface FeatureAccessResponse {
  phase: number;
  problemsInPhase: number;
  problemsToNextPhase: number;
  showConfidenceMetrics: boolean;
  showPatternUsageStats: boolean;
  showBlindSpots: boolean;
  showPatternDecay: boolean;
  showThinkingReplay: boolean;
  showInterviewReadiness: boolean;
}

export interface UserProfileResponse {
  userId: string;
  isQualified: boolean;
  dsaProblemsCompleted: number;
  qualifiedAt: string | null;
  currentPhase: number;
  completedAttempts: number;
  wasGrandfathered: boolean;
  interviewReadinessOptIn: boolean;
  featureAccess: FeatureAccessResponse;
}

export interface QualificationCheckResponse {
  isQualified: boolean;
  needsQualification: boolean;
  message: string | null;
}

export interface ActiveAttemptResponse {
  attemptId: string;
  problemTitle: string;
  startedAt: string;
  status: string;
}

export const profileApi = {
  // Get current user's profile
  getProfile: () => api.get<UserProfileResponse>("/api/profile"),

  // Submit qualification answers
  qualify: (dsaProblemsCompleted: number) =>
    api.post<UserProfileResponse>("/api/profile/qualify", {
      dsaProblemsCompleted,
    }),

  // Check if user needs qualification
  checkQualification: () =>
    api.get<QualificationCheckResponse>("/api/profile/check"),

  // Get active attempt (for loop enforcement) - returns null if no active attempt
  getActiveAttempt: () => api.get<ActiveAttemptResponse | null>("/api/profile/active-attempt"),

  // Opt into interview readiness mode
  optInInterviewReadiness: () =>
    api.post<UserProfileResponse>("/api/profile/interview-readiness", {}),
};

export { api, ApiError } from "./client";
export { authApi } from "./auth";

// LeetCode API types
export interface LeetCodeProblem {
  questionId: string;
  frontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  acceptanceRate: number;
  tags: string[];
}

export interface LeetCodeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface LeetCodeProblemDetail {
  questionId: string;
  frontendId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  tags: string[];
  examples: LeetCodeExample[];
}

export interface LeetCodeSyncResult {
  totalFetched: number;
  newlyCreated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

// New types for the dynamic LeetCode flow
export interface CachedProblemResponse {
  id: string;
  leetCodeId: string;
  frontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  content: string;
  tags: string[];
  hasAnalysis: boolean;
  cachedAt: string;
}

export interface ProblemAnalysisResponse {
  id: string;
  primaryPatterns: string[];
  secondaryPatterns: string[];
  keySignals: string;
  commonMistakes: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyInsight: string;
  approachExplanation: string;
  similarProblems: string[];
  analyzedAt: string;
}

export interface AttemptStartResponse {
  attemptId: string;
  problemCacheId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  tags: string[];
}

export interface ReflectionResponse {
  id: string;
  feedback: string;
  correctIdentifications: string;
  missedSignals: string;
  nextTimeAdvice: string;
  patternTips: string;
  confidenceCalibration: string;
  isCorrectPattern: boolean;
  generatedAt: string;
}

// LeetCode API - for fetching and syncing problems
export const leetcodeApi = {
  // Search problems (filtered to algorithmic)
  search: (query: string, limit: number = 20) =>
    api.get<LeetCodeProblem[]>(
      `/api/leetcode/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    ),

  // Fetch problems directly from LeetCode (public)
  getProblems: (limit: number = 50, skip: number = 0) =>
    api.get<LeetCodeProblem[]>(
      `/api/leetcode/problems?limit=${limit}&skip=${skip}`,
    ),

  // Fetch a specific problem's details (caches locally)
  getProblemDetail: (titleSlug: string) =>
    api.get<CachedProblemResponse>(`/api/leetcode/problems/${titleSlug}`),

  // Analyze a problem using LLM
  analyzeProblem: (titleSlug: string) =>
    api.post<ProblemAnalysisResponse>(
      `/api/leetcode/problems/${titleSlug}/analyze`,
      {},
    ),

  // Start an attempt on a LeetCode problem
  startAttempt: (titleSlug: string) =>
    api.post<AttemptStartResponse>(
      `/api/leetcode/problems/${titleSlug}/start`,
      {},
    ),

  // Sync problems to database (admin only)
  syncProblems: (count: number = 50) =>
    api.post<LeetCodeSyncResult>(`/api/leetcode/sync?count=${count}`, {}),
};

// Reflection API - for generating and retrieving reflections
export const reflectionApi = {
  // Generate a reflection for a completed attempt
  generate: (
    attemptId: string,
    data: {
      chosenPattern: string;
      identifiedSignals: string;
      confidenceLevel: number;
    },
  ) =>
    api.post<ReflectionResponse>(`/api/attempts/${attemptId}/reflection`, data),

  // Get an existing reflection
  get: (attemptId: string) =>
    api.get<ReflectionResponse>(`/api/attempts/${attemptId}/reflection`),
};

// ===== PATTERN TRACKING API (Blind Spot Detection) =====

export interface DecayingPatternInfo {
  patternId: string;
  patternName: string;
  lastUsedAt: string;
  daysSinceLastUse: number;
  totalTimesUsed: number;
  successRate: number;
}

export interface DefaultPatternInfo {
  patternId: string;
  patternName: string;
  timesChosen: number;
  consecutiveChoices: number;
  percentageOfTotal: number;
  successRate: number;
}

export interface AvoidedPatternInfo {
  patternId: string;
  patternName: string;
  timesCorrectAnswer: number;
  timesUserChoseIt: number;
}

export interface PatternUsageStatsResponse {
  decayingPatterns: DecayingPatternInfo[];
  defaultPatterns: DefaultPatternInfo[];
  avoidedPatterns: AvoidedPatternInfo[];
  totalAttempts: number;
  uniquePatternsPracticed: number;
  totalPatterns: number;
}

export interface PatternNudgeResponse {
  patternId: string;
  patternName: string;
  consecutiveChoices: number;
  message: string;
}

export const patternTrackingApi = {
  // Get complete pattern usage statistics
  getStats: () =>
    api.get<PatternUsageStatsResponse>("/api/patterns/tracking/stats"),

  // Get patterns that haven't been practiced recently
  getDecayingPatterns: (days: number = 30) =>
    api.get<DecayingPatternInfo[]>(`/api/patterns/tracking/decaying?days=${days}`),

  // Get patterns the user frequently defaults to
  getDefaultPatterns: (minOccurrences: number = 3) =>
    api.get<DefaultPatternInfo[]>(`/api/patterns/tracking/defaults?minOccurrences=${minOccurrences}`),

  // Check if user should be nudged about over-relying on a pattern
  checkNudge: (patternId: string) =>
    api.get<PatternNudgeResponse | null>(`/api/patterns/tracking/nudge/${patternId}`),
};
