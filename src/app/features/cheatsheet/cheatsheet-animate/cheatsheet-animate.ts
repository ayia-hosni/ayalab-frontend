import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CheatsheetService } from '../../../core/services/cheatsheet.service';
import { CATEGORY_LABELS, CheatFunction, CheatLang } from '../../../core/models/cheatsheet.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-cheatsheet-animate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Topbar],
  templateUrl: './cheatsheet-animate.html',
  styleUrl: './cheatsheet-animate.css',
})
export class CheatsheetAnimate implements OnInit {
  private service = inject(CheatsheetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  lang = inject(LanguageService);

  cheatLang = signal<CheatLang>('php');
  search = signal('');
  activeCategory = signal<string | null>(null);
  fn = signal<CheatFunction | null>(null);
  notFound = signal(false);
  playKey = signal(0);

  functions = computed(() => this.service.list(this.cheatLang()));
  categories = computed(() => this.service.categories(this.cheatLang()));

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cat = this.activeCategory();
    return this.functions().filter((f) => {
      if (cat && f.category !== cat) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q) || f.summary.en.toLowerCase().includes(q) || f.summary.ar.includes(q);
    });
  });

  exampleLines = computed(() => {
    const f = this.fn();
    return f ? f.example.split('\n') : [];
  });

  outputLines = computed(() => {
    const f = this.fn();
    return f ? f.output.split('\n') : [];
  });

  ngOnInit(): void {
    const routeLang = this.route.snapshot.paramMap.get('lang') as CheatLang | null;
    const slug = this.route.snapshot.paramMap.get('slug');
    const initialLang: CheatLang = routeLang === 'java' ? 'java' : 'php';
    this.cheatLang.set(initialLang);

    const list = this.service.list(initialLang);
    if (!list.length) { this.notFound.set(true); return; }

    const found = slug ? this.service.get(initialLang, slug) : undefined;
    if (found) {
      this.fn.set(found);
      this.playKey.update((v) => v + 1);
    } else {
      this.select(list[0]);
    }
  }

  select(f: CheatFunction): void {
    this.notFound.set(false);
    this.fn.set(f);
    this.playKey.update((v) => v + 1);
    this.router.navigate(['/cheatsheet/animate', f.lang, f.slug], { replaceUrl: true });
  }

  setLang(l: CheatLang): void {
    if (l === this.cheatLang()) return;
    this.cheatLang.set(l);
    this.activeCategory.set(null);
    const list = this.service.list(l);
    if (list.length) this.select(list[0]);
  }

  setCategory(c: string | null): void { this.activeCategory.set(c); }

  replay(): void { this.playKey.update((v) => v + 1); }

  hasActiveFilters(): boolean {
    return !!this.search().trim() || this.activeCategory() !== null;
  }

  reset(): void {
    this.search.set('');
    this.activeCategory.set(null);
  }

  categoryLabel(category: string): string {
    const entry = CATEGORY_LABELS[category];
    return entry ? this.lang.pick(entry) : category;
  }

  summaryOf(f: CheatFunction): string { return this.lang.pick(f.summary); }

  // ── Animation timing — staged reveal, proportional to how much content each stage has ──
  exampleDelay(i: number): number { return 250 + i * 110; }

  runDelay(): number { return 250 + this.exampleLines().length * 110 + 200; }

  outputDelay(i: number): number { return this.runDelay() + 650 + i * 100; }

  descDelay(): number {
    const n = this.outputLines().length;
    return this.outputDelay(Math.max(n - 1, 0)) + 380;
  }
}
