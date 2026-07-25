import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { CheatsheetService } from '../../../core/services/cheatsheet.service';
import { CATEGORY_LABELS, CheatLang } from '../../../core/models/cheatsheet.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-cheatsheet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Topbar],
  templateUrl: './cheatsheet-list.html',
  styleUrl: './cheatsheet-list.css',
})
export class CheatsheetList {
  private service = inject(CheatsheetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  lang = inject(LanguageService);

  cheatLang = signal<CheatLang>(
    this.route.snapshot.queryParamMap.get('lang') === 'java' ? 'java' : 'php'
  );
  search = signal('');
  activeCategory = signal<string | null>(null);

  functions = computed(() => this.service.list(this.cheatLang()));
  categories = computed(() => this.service.categories(this.cheatLang()));

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cat = this.activeCategory();
    return this.functions().filter((fn) => {
      if (cat && fn.category !== cat) return false;
      if (!q) return true;
      return fn.name.toLowerCase().includes(q)
        || fn.summary.en.toLowerCase().includes(q)
        || fn.summary.ar.includes(q);
    });
  });

  categoryLabel(category: string): string {
    const entry = CATEGORY_LABELS[category];
    return entry ? this.lang.pick(entry) : category;
  }

  summaryOf(fn: { summary: { en: string; ar: string } }): string {
    return this.lang.pick(fn.summary);
  }

  setLang(l: CheatLang): void {
    this.cheatLang.set(l);
    this.activeCategory.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: { lang: l }, replaceUrl: true });
  }

  setCategory(c: string | null): void { this.activeCategory.set(c); }

  hasActiveFilters(): boolean {
    return !!this.search().trim() || this.activeCategory() !== null;
  }

  reset(): void {
    this.search.set('');
    this.activeCategory.set(null);
  }

  open(slug: string): void {
    this.router.navigate(['/cheatsheet/animate', this.cheatLang(), slug]);
  }
}
