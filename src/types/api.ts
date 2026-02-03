// Domain Types matching backend API

// Difficulty enum values from backend (1=Easy, 2=Medium, 3=Hard)
export type DifficultyValue = 1 | 2 | 3;
export type DifficultyLabel = "Easy" | "Medium" | "Hard";

// Helper to convert difficulty value to label
export const DIFFICULTY_MAP: Record<DifficultyValue, DifficultyLabel> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

export function getDifficultyLabel(
  value: DifficultyValue | number,
): DifficultyLabel {
  return DIFFICULTY_MAP[value as DifficultyValue] || "Medium";
}

// Pattern Category - backend returns as string
export type PatternCategoryLabel =
  | "Array"
  | "String"
  | "LinkedList"
  | "Tree"
  | "Graph"
  | "DynamicProgramming"
  | "Greedy"
  | "BinarySearch"
  | "TwoPointers"
  | "SlidingWindow"
  | "Stack"
  | "Queue"
  | "Heap"
  | "Trie"
  | "Backtracking"
  | "Math"
  | "BitManipulation"
  | "UnionFind"
  | "MonotonicStack"
  | "Intervals"
  | "DivideAndConquer"
  | "PrefixSum"
  | "Matrix";

// Display labels for pattern categories (add spaces for readability)
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  Array: "Array",
  String: "String",
  LinkedList: "Linked List",
  Tree: "Tree",
  Graph: "Graph",
  DynamicProgramming: "Dynamic Programming",
  Greedy: "Greedy",
  BinarySearch: "Binary Search",
  TwoPointers: "Two Pointers",
  SlidingWindow: "Sliding Window",
  Stack: "Stack",
  Queue: "Queue",
  Heap: "Heap",
  Trie: "Trie",
  Backtracking: "Backtracking",
  Math: "Math",
  BitManipulation: "Bit Manipulation",
  UnionFind: "Union Find",
  MonotonicStack: "Monotonic Stack",
  Intervals: "Intervals",
  DivideAndConquer: "Divide and Conquer",
  PrefixSum: "Prefix Sum",
  Matrix: "Matrix",
};

// Category complexity order for sorting (lower = easier)
export const CATEGORY_COMPLEXITY_ORDER: Record<string, number> = {
  Array: 1,
  String: 2,
  TwoPointers: 3,
  SlidingWindow: 4,
  BinarySearch: 5,
  Stack: 6,
  Queue: 7,
  LinkedList: 8,
  PrefixSum: 9,
  Heap: 10,
  Tree: 11,
  Trie: 12,
  Greedy: 13,
  Intervals: 14,
  MonotonicStack: 15,
  Matrix: 16,
  Backtracking: 17,
  Graph: 18,
  UnionFind: 19,
  DivideAndConquer: 20,
  DynamicProgramming: 21,
  BitManipulation: 22,
  Math: 23,
};

// Pattern difficulty levels
export type PatternDifficulty = "Beginner" | "Intermediate" | "Advanced";

// Map pattern categories to difficulty levels
export const CATEGORY_DIFFICULTY_MAP: Record<string, PatternDifficulty> = {
  // Beginner - foundational patterns, easy to understand
  Array: "Beginner",
  String: "Beginner",
  TwoPointers: "Beginner",
  SlidingWindow: "Beginner",
  LinkedList: "Beginner",
  Stack: "Beginner",
  Queue: "Beginner",

  // Intermediate - require more problem-solving skills
  BinarySearch: "Intermediate",
  PrefixSum: "Intermediate",
  Heap: "Intermediate",
  Greedy: "Intermediate",
  Intervals: "Intermediate",
  Matrix: "Intermediate",
  Math: "Intermediate",

  // Advanced - complex algorithms and data structures
  Tree: "Advanced",
  Trie: "Advanced",
  Graph: "Advanced",
  Backtracking: "Advanced",
  UnionFind: "Advanced",
  DivideAndConquer: "Advanced",
  DynamicProgramming: "Advanced",
  MonotonicStack: "Advanced",
  BitManipulation: "Advanced",
};

// Pattern algorithm type (Linear vs Non-Linear data structures)
export type AlgorithmType = "Linear" | "Non-Linear";

// Map pattern categories to algorithm types
export const CATEGORY_ALGORITHM_TYPE_MAP: Record<string, AlgorithmType> = {
  // Linear - sequential/array-based structures
  Array: "Linear",
  String: "Linear",
  TwoPointers: "Linear",
  SlidingWindow: "Linear",
  BinarySearch: "Linear",
  Stack: "Linear",
  Queue: "Linear",
  LinkedList: "Linear",
  PrefixSum: "Linear",
  Intervals: "Linear",
  Matrix: "Linear",
  MonotonicStack: "Linear",

  // Non-Linear - hierarchical/graph-based structures
  Tree: "Non-Linear",
  Trie: "Non-Linear",
  Graph: "Non-Linear",
  Heap: "Non-Linear",
  Backtracking: "Non-Linear",
  UnionFind: "Non-Linear",
  DivideAndConquer: "Non-Linear",
  DynamicProgramming: "Non-Linear",
  Greedy: "Non-Linear",
  BitManipulation: "Non-Linear",
  Math: "Non-Linear",
};

// Difficulty order for sorting
export const DIFFICULTY_ORDER: Record<PatternDifficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

// Get difficulty for a pattern category
export function getCategoryDifficulty(category: string): PatternDifficulty {
  return CATEGORY_DIFFICULTY_MAP[category] || "Intermediate";
}

// Get algorithm type for a pattern category
export function getCategoryAlgorithmType(category: string): AlgorithmType {
  return CATEGORY_ALGORITHM_TYPE_MAP[category] || "Linear";
}

export function getCategoryLabel(value: string | number): string {
  if (typeof value === "string") {
    return CATEGORY_DISPLAY_MAP[value] || value;
  }
  // Fallback for numeric values (legacy)
  return "Unknown";
}

// Legacy type for compatibility
export type PatternCategory =
  | "Arrays"
  | "Strings"
  | "LinkedLists"
  | "Trees"
  | "Graphs"
  | "DynamicProgramming"
  | "Sorting"
  | "Searching"
  | "Recursion"
  | "Other";

export interface Pattern {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLabel;
  category: PatternCategory;
  keyCharacteristics: string[];
  whenToUse: string[];
  commonMistakes: string[];
  relatedPatterns: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WrongApproach {
  id: string;
  problemId: string;
  description: string;
  whyItFails: string;
  commonMistake: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLabel;
  patternId: string;
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];
  solutionApproach: string;
  solutionCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  wrongApproaches: WrongApproach[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  thinkingPhaseNotes: string;
  confidenceLevel: number; // 1-5
  wasCorrect: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
  wrongApproachesViewed: string[];
}

// Backend Attempt response (matches AttemptResponse DTO)
export type AttemptStatus =
  | "InProgress"
  | "ColdStartCompleted"
  | "Solved"
  | "GaveUp"
  | "TimedOut";

export interface ColdStartResponseDto {
  id: string;
  identifiedSignals: string;
  chosenPatternId: string;
  chosenPatternName: string;
  rejectedPatternId?: string;
  rejectedPatternName?: string;
  rejectionReason?: string;
  thinkingDurationSeconds: number;
  submittedAt: string;
}

export interface AttemptResponseDto {
  id: string;
  problemId: string;
  problemTitle: string;
  status: AttemptStatus;
  confidence?: number;
  isPatternCorrect?: boolean;
  startedAt: string;
  completedAt?: string;
  totalTimeSeconds?: number;
  coldStart?: ColdStartResponseDto;
}

// Confidence Dashboard response (matches ConfidenceDashboardResponse DTO)
export interface ConfidenceStatsDto {
  confidence: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  correctPercentage: number;
}

export interface PatternWeaknessDto {
  patternId: string;
  patternName: string;
  totalAttempts: number;
  wrongCount: number;
  wrongPercentage: number;
  insight: string;
}

export interface ConfidenceDashboardDto {
  stats: ConfidenceStatsDto[];
  overconfidentPatterns: PatternWeaknessDto[];
  fragilePatterns: PatternWeaknessDto[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Request Types
export interface CreateAttemptRequest {
  problemId: string;
}

export interface UpdateAttemptRequest {
  thinkingPhaseNotes?: string;
  confidenceLevel?: number;
  wasCorrect?: boolean;
  hintsUsed?: number;
  wrongApproachesViewed?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// ASP.NET Core Identity token response
export interface TokenResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

// User info from /manage/info
export interface UserInfo {
  email: string;
  isEmailConfirmed: boolean;
}

// Backend Pattern response (matches PatternResponse DTO)
export interface ResourceLink {
  title: string;
  url: string;
  type: string;
}

export interface PatternResponse {
  id: string;
  name: string;
  description: string;
  category: string; // Backend returns enum as string
  whatItIs: string;
  whenToUse: string;
  whyItWorks: string;
  commonUseCases: string[];
  timeComplexity: string;
  spaceComplexity: string;
  pseudoCode: string;
  triggerSignals: string[];
  commonMistakes: string[];
  resources: ResourceLink[];
  relatedPatternIds: string[];
}

// Data Structure Category - backend returns as string
export type DataStructureCategoryLabel =
  | "Linear"
  | "HashBased"
  | "Tree"
  | "Heap"
  | "Graph"
  | "Advanced";

// Display labels for data structure categories
export const DATA_STRUCTURE_CATEGORY_DISPLAY_MAP: Record<string, string> = {
  Linear: "Linear",
  HashBased: "Hash-Based",
  Tree: "Tree",
  Heap: "Heap",
  Graph: "Graph",
  Advanced: "Advanced",
};

// Data structure category complexity order for sorting
export const DATA_STRUCTURE_CATEGORY_ORDER: Record<string, number> = {
  Linear: 1,
  HashBased: 2,
  Heap: 3,
  Tree: 4,
  Graph: 5,
  Advanced: 6,
};

export function getDataStructureCategoryLabel(value: string | number): string {
  if (typeof value === "string") {
    return DATA_STRUCTURE_CATEGORY_DISPLAY_MAP[value] || value;
  }
  return "Unknown";
}

// Backend DataStructure response
export interface OperationInfo {
  name: string;
  timeComplexity: string;
  description: string;
}

export interface DataStructureResponse {
  id: string;
  name: string;
  description: string;
  category: string; // Backend returns enum as string
  whatItIs: string;
  operations: OperationInfo[];
  whenToUse: string;
  tradeoffs: string;
  commonUseCases: string[];
  implementation: string;
  resources: ResourceLink[];
  relatedStructureIds: string[];
}

// Backend Problem response (matches ProblemResponse DTO)
export interface ProblemResponse {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyValue;
  signals: string[];
  constraints: string[];
  examples: string[];
}

// Backend Problem brief response
export interface ProblemBriefResponse {
  id: string;
  title: string;
  difficulty: DifficultyValue;
}

// Backend Wrong Approach response
export interface WrongApproachResponse {
  patternId: string;
  patternName: string;
  explanation: string;
  frequencyPercent: number;
}

// Backend Problem with solution revealed
export interface ProblemWithSolutionResponse {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyValue;
  signals: string[];
  constraints: string[];
  examples: string[];
  correctPatternId: string;
  correctPatternName: string;
  keyInvariant: string;
  solutionExplanation: string;
  wrongApproaches: WrongApproachResponse[];
}
