export interface AdminTestCase {
  id?: number;
  ordinal: number;
  sample: boolean;
  inputJson: string;
  outputJson: string;
}

export interface AdminProblemDetail {
  id: number;
  title: string;
  slug: string;
  acceptance: number;
  difficulty: string;
  status: string;
  tags: string[];
  available: boolean;
  visualizerType: string | null;
  description: string | null;
  starterCode: Record<string, string>;
  testCases: AdminTestCase[];
}

export interface AdminProblemRequest {
  id: number | null;
  title: string;
  slug: string;
  acceptance: number;
  difficulty: string;
  tags: string[];
  description: string;
  visualizerType: string | null;
  starterCode: Record<string, string>;
  available: boolean;
  testCases: AdminTestCase[];
}
