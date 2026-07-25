export interface BilingualText {
  en: string;
  ar: string;
}

export interface Slide {
  id: number;
  kicker: BilingualText;
  title: BilingualText;
  visual: string;
  body: BilingualText;
}

export interface Lesson {
  id: number;
  icon: string;
  title: BilingualText;
  description: BilingualText;
  /** Topic group, e.g. "Linked Lists" — every lesson belongs to one. */
  section: BilingualText;
  /** Optional sub-tag within the section, e.g. "Insertion"; undefined means uncategorized. */
  category?: BilingualText;
  slideCount: number;
}

export interface LessonWithSlides extends Lesson {
  slides: Slide[];
}
