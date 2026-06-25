export type Difficulty = 'easy' | 'medium' | 'hard';
export type ProblemStatus = 'todo' | 'attempted' | 'solved';

export interface ProblemSummary {
  id: number;
  title: string;
  slug: string;
  acceptance: number;
  difficulty: Difficulty;
  status: ProblemStatus;
  tags: string[];
  hasVisualizer: boolean;
  available: boolean;
}

export interface ProblemDetail extends ProblemSummary {
  description: string | null;
  /** Starter code per language, e.g. { javascript: '…', python: '…', java: '…' }. */
  starterCode: Record<string, string> | null;
}

export interface CaseResult {
  passed: boolean;
  input: number[];
  expected: number[];
  actual: number[] | null;
  error: string | null;
}

export interface SubmitResult {
  accepted: boolean;
  verdict: string;
  compileError: string | null;
  runtimeMs: number;
  cases: CaseResult[];
}

export interface SubmitRequest {
  language: string;
  code: string;
  submit: boolean;
}

export interface ProblemFilters {
  difficulty?: string;
  status?: string;
  search?: string;
  tag?: string;
}
