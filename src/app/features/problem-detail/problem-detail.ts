import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { ProblemService } from '../../core/services/problem.service';
import {
  ProblemDetail as ProblemDetailModel,
  SubmitResult,
} from '../../core/models/problem.models';
import { LinkedListGameComponent } from './linked-list-game.component';
import { SolutionSlidesComponent } from './solution-slides.component';
import { MovePointerComponent } from './move-pointer.component';
import { LanguageService } from '../../core/services/language.service';
import { Topbar } from '../../shared/topbar/topbar';
import { CodeEditor } from '../../shared/code-editor/code-editor';

type Lang = 'javascript' | 'python' | 'java';

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LinkedListGameComponent, SolutionSlidesComponent, MovePointerComponent, Topbar, CodeEditor],
  templateUrl: './problem-detail.html',
  styleUrl: './problem-detail.css',
})
export class ProblemDetail implements OnInit {
  private service = inject(ProblemService);
  private route = inject(ActivatedRoute);
  siteLang = inject(LanguageService);

  problem = signal<ProblemDetailModel | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  activeTab = signal<2 | 6 | 8 | 9>(6);
  lang = signal<Lang>('javascript');

  code = signal<string>('');
  private starter: Record<string, string> | null = null;

  running = signal<boolean>(false);
  result = signal<SubmitResult | null>(null);

  langLabel = computed(() => {
    switch (this.lang()) {
      case 'javascript': return 'JavaScript';
      case 'python':     return 'Python';
      case 'java':       return 'Java';
    }
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.service.get(slug).subscribe({
      next: (p) => {
        this.problem.set(p);
        this.activeTab.set(6);
        if (p.starterCode && Object.keys(p.starterCode).length > 0) {
          this.starter = p.starterCode;
          this.code.set(this.starter['javascript'] ?? '');
        }
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  showTab(n: 2 | 6 | 8 | 9): void { this.activeTab.set(n); }

  showLang(l: Lang): void {
    this.lang.set(l);
    if (this.starter) this.code.set(this.starter[l] ?? '');
  }

  get readOnlyCode(): boolean { return this.lang() === 'python'; }

  resetCode(): void {
    if (this.starter) this.code.set(this.starter[this.lang()]);
    this.result.set(null);
  }

  run(submit: boolean): void {
    const p = this.problem();
    if (!p) return;
    this.running.set(true);
    this.result.set(null);
    this.service
      .submit(p.slug, { language: this.lang(), code: this.code(), submit })
      .subscribe({
        next: (r) => { this.result.set(r); this.running.set(false); },
        error: () => {
          this.result.set({
            accepted: false, verdict: 'Error',
            compileError: 'Could not reach the judge service. Is the backend running?',
            runtimeMs: 0, cases: [],
          });
          this.running.set(false);
        },
      });
  }
}
