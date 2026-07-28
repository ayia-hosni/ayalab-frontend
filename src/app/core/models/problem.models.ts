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

/** Interactive game content per visualizer tab. Each value is a raw JSON string owned by
 *  the matching frontend engine (chain-trace-engine / pointer-drag-engine / solution-slides'
 *  chain-trace-engine or recursion-tree-engine); absent keys mean that tab has no game yet. */
export interface GameConfigs {
  traceGame?: string;
  movePointer?: string;
  solutionSlides?: string;
}

export interface ProblemDetail extends ProblemSummary {
  description: string | null;
  /** Arabic translation of `description`; null when not yet translated. */
  descriptionAr: string | null;
  /** Starter code per language, e.g. { javascript: '…', python: '…', java: '…' }. */
  starterCode: Record<string, string> | null;
  gameConfigs: GameConfigs | null;
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
