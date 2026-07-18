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
  slideCount: number;
}

export interface LessonWithSlides extends Lesson {
  slides: Slide[];
}
