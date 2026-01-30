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

// Pattern Category enum values from backend
export type PatternCategoryValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;
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

export const CATEGORY_MAP: Record<PatternCategoryValue, PatternCategoryLabel> =
  {
    1: "Array",
    2: "String",
    3: "LinkedList",
    4: "Tree",
    5: "Graph",
    6: "DynamicProgramming",
    7: "Greedy",
    8: "BinarySearch",
    9: "TwoPointers",
    10: "SlidingWindow",
    11: "Stack",
    12: "Queue",
    13: "Heap",
    14: "Trie",
    15: "Backtracking",
    16: "Math",
    17: "BitManipulation",
    18: "UnionFind",
    19: "MonotonicStack",
    20: "Intervals",
    21: "DivideAndConquer",
    22: "PrefixSum",
    23: "Matrix",
  };

export function getCategoryLabel(
  value: PatternCategoryValue | number,
): PatternCategoryLabel {
  return CATEGORY_MAP[value as PatternCategoryValue] || "Array";
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
  category: number; // Backend returns enum as number
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

// Data Structure Category enum values from backend
export type DataStructureCategoryValue = 1 | 2 | 3 | 4 | 5 | 6;
export type DataStructureCategoryLabel =
  | "Linear"
  | "HashBased"
  | "Tree"
  | "Heap"
  | "Graph"
  | "Advanced";

export const DATA_STRUCTURE_CATEGORY_MAP: Record<
  DataStructureCategoryValue,
  DataStructureCategoryLabel
> = {
  1: "Linear",
  2: "HashBased",
  3: "Tree",
  4: "Heap",
  5: "Graph",
  6: "Advanced",
};

export function getDataStructureCategoryLabel(
  value: DataStructureCategoryValue | number,
): DataStructureCategoryLabel {
  return (
    DATA_STRUCTURE_CATEGORY_MAP[value as DataStructureCategoryValue] || "Linear"
  );
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
  category: number;
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
