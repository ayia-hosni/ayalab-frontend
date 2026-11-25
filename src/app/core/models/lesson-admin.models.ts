import type { SlideSpec } from './slide-spec.models';

export type LocaleCode = 'en' | 'ar';

export interface AdminLessonText {
  title: string;
  description: string;
}

export interface AdminSlideText {
  kicker: string;
  title: string;
  body: string;
}

export interface AdminSlide {
  /** Absent for a slide that has not been saved yet. */
  id?: number;
  ordinal?: number;
  spec: SlideSpec;
  translations: Partial<Record<LocaleCode, AdminSlideText>>;
}

export interface AdminLessonDetail {
  id: number;
  slug: string;
  ordinal: number;
  icon: string;
  published: boolean;
  sectionId: number;
  categoryId: number | null;
  translations: Partial<Record<LocaleCode, AdminLessonText>>;
  slides: AdminSlide[];
}

export interface AdminLessonRequest {
  slug: string;
  ordinal: number;
  icon: string;
  published: boolean;
  sectionId: number;
  categoryId: number | null;
  translations: Partial<Record<LocaleCode, AdminLessonText>>;
  slides: AdminSlide[];
}

export interface AdminCategory {
  id: number;
  slug: string;
  ordinal: number;
  names: Partial<Record<LocaleCode, string>>;
}

export interface AdminSection extends AdminCategory {
  categories: AdminCategory[];
}

export interface AdminTaxonomy {
  sections: AdminSection[];
}

export interface TaxonomyRequest {
  slug: string;
  /** Required when creating a category; ignored for a section. */
  sectionId?: number;
  names: Partial<Record<LocaleCode, string>>;
}
