export interface AdminSlide {
  id?: number;
  ordinal: number;
  kickerEn: string;
  kickerAr: string;
  titleEn: string;
  titleAr: string;
  visual: string;
  visualSpec: string | null;
  bodyEn: string;
  bodyAr: string;
}

export interface AdminLessonDetail {
  id: number;
  ordinal: number;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sectionEn: string;
  sectionAr: string;
  categoryEn: string | null;
  categoryAr: string | null;
  slides: AdminSlide[];
}

export interface AdminLessonRequest {
  ordinal: number;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sectionEn: string;
  sectionAr: string;
  categoryEn: string | null;
  categoryAr: string | null;
  slides: AdminSlide[];
}
