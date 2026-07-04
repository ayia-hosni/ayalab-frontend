export interface BilingualText {
  en: string;
  ar: string;
}

export interface Slide {
  kicker: BilingualText;
  title: BilingualText;
  visual: string;
  body: BilingualText;
}

export interface Lesson {
  icon: string;
  title: BilingualText;
  description: BilingualText;
  start: number;
  end: number;
}
