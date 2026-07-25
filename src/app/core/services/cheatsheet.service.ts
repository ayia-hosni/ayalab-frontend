import { Injectable } from '@angular/core';

import { CHEATSHEET_FUNCTIONS } from '../data/cheatsheet-data';
import { CheatFunction, CheatLang } from '../models/cheatsheet.models';

@Injectable({ providedIn: 'root' })
export class CheatsheetService {
  private readonly all = CHEATSHEET_FUNCTIONS;

  list(lang: CheatLang): CheatFunction[] {
    return this.all.filter((f) => f.lang === lang);
  }

  categories(lang: CheatLang): string[] {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const fn of this.list(lang)) {
      if (!seen.has(fn.category)) { seen.add(fn.category); ordered.push(fn.category); }
    }
    return ordered;
  }

  get(lang: CheatLang, slug: string): CheatFunction | undefined {
    return this.all.find((f) => f.lang === lang && f.slug === slug);
  }

  equivalentOf(fn: CheatFunction): CheatFunction | undefined {
    if (!fn.equivalentSlug) return undefined;
    const otherLang: CheatLang = fn.lang === 'php' ? 'java' : 'php';
    return this.get(otherLang, fn.equivalentSlug);
  }
}
