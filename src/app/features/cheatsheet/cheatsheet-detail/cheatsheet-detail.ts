import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CheatsheetService } from '../../../core/services/cheatsheet.service';
import { CATEGORY_LABELS, CheatFunction, CheatLang } from '../../../core/models/cheatsheet.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-cheatsheet-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './cheatsheet-detail.html',
  styleUrl: './cheatsheet-detail.css',
})
export class CheatsheetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CheatsheetService);
  lang = inject(LanguageService);

  fn = signal<CheatFunction | null>(null);
  equivalent = signal<CheatFunction | null>(null);
  notFound = signal(false);

  ngOnInit(): void {
    const cheatLang = this.route.snapshot.paramMap.get('lang') as CheatLang | null;
    const slug = this.route.snapshot.paramMap.get('slug');
    const found = cheatLang && slug ? this.service.get(cheatLang, slug) : undefined;

    if (!found) {
      this.notFound.set(true);
      return;
    }

    this.fn.set(found);
    this.equivalent.set(this.service.equivalentOf(found) ?? null);
  }

  goToEquivalent(): void {
    const eq = this.equivalent();
    if (eq) this.router.navigate(['/cheatsheet', eq.lang, eq.slug]);
  }

  categoryLabel(category: string): string {
    const entry = CATEGORY_LABELS[category];
    return entry ? this.lang.pick(entry) : category;
  }
}
