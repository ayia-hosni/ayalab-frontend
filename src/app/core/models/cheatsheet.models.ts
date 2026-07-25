import { BilingualText } from './lesson.models';

export type CheatLang = 'php' | 'java';

export interface CheatFunction {
  slug: string;
  lang: CheatLang;
  /** Function/method name — kept English-only, like code identifiers elsewhere in the app. */
  name: string;
  /** Category key used for filtering — English, not shown directly (see CATEGORY_LABELS for display). */
  category: string;
  /** Kept English-only — code stays LTR/English even in Arabic mode, matching the rest of the app. */
  signature: string;
  summary: BilingualText;
  description: BilingualText;
  /** Kept English-only — code. */
  example: string;
  /** Kept English-only — code. */
  output: string;
  /** Slug of the equivalent function in the other language, if one exists. */
  equivalentSlug?: string;
}

/** Display labels for the `category` filter keys used across CheatFunction entries. */
export const CATEGORY_LABELS: Record<string, BilingualText> = {
  'String': { en: 'String', ar: 'نصوص' },
  'Array': { en: 'Array', ar: 'مصفوفات' },
  'Array / Stream': { en: 'Array / Stream', ar: 'مصفوفات / Stream' },
  'Type & Char': { en: 'Type & Char', ar: 'أنواع وحروف' },
};
