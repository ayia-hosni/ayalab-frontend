import type { SlideSpec } from './slide-spec.models';

/** Still used by the cheatsheet feature, which keeps both languages in one payload. */
export interface BilingualText {
  en: string;
  ar: string;
}

/** A section or category, already named in the requested language. */
export interface TaxonomyRef {
  slug: string;
  name: string;
}

export interface Slide {
  id: number;
  ordinal: number;
  kicker: string;
  title: string;
  body: string;
  visual: SlideSpec;
}

export interface LessonSummary {
  id: number;
  slug: string;
  ordinal: number;
  icon: string;
  title: string;
  description: string;
  section: TaxonomyRef;
  /** Null means uncategorized within the section. */
  category: TaxonomyRef | null;
  slideCount: number;
}

export interface LessonDetail extends Omit<LessonSummary, 'slideCount'> {
  slides: Slide[];
}
