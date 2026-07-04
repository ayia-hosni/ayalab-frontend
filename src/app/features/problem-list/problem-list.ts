import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { ProblemService } from '../../core/services/problem.service';
import { ProblemSummary, ProblemFilters } from '../../core/models/problem.models';

@Component({
  selector: 'app-problem-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './problem-list.html',
  styleUrl: './problem-list.css',
})
export class ProblemList implements OnInit {
  private service = inject(ProblemService);
  private router = inject(Router);

  private _all = signal<ProblemSummary[]>([]);
  private _filtered = signal<ProblemSummary[]>([]);

  problems = computed(() => this._filtered());
  total = computed(() => this.problems().length);
  totalAll = computed(() => this._all().length);

  tags = signal<string[]>([]);
  loading = signal<boolean>(true);

  readonly circumference = 2 * Math.PI * 48;

  totalSolved = computed(() => this._all().filter(p => p.status === 'solved').length);

  totalProgressOffset = computed(() => {
    const pct = this.totalAll() ? this.totalSolved() / this.totalAll() : 0;
    return this.circumference * (1 - pct);
  });

  easyStats = computed(() => {
    const all = this._all().filter(p => p.difficulty === 'easy');
    return { total: all.length, solved: all.filter(p => p.status === 'solved').length };
  });
  mediumStats = computed(() => {
    const all = this._all().filter(p => p.difficulty === 'medium');
    return { total: all.length, solved: all.filter(p => p.status === 'solved').length };
  });
  hardStats = computed(() => {
    const all = this._all().filter(p => p.difficulty === 'hard');
    return { total: all.length, solved: all.filter(p => p.status === 'solved').length };
  });

  difficulty = 'all';
  status = 'all';
  search = '';
  activeTag: string | null = null;

  private searchChanged = new Subject<void>();

  readonly statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'Todo' },
    { value: 'attempted', label: 'Attempted' },
    { value: 'solved', label: 'Solved' },
  ];

  ngOnInit(): void {
    this.service.tags().subscribe(t => this.tags.set(t));

    this.service.list({}).subscribe(rows => {
      this._all.set(rows);
      this._filtered.set(rows);
      this.loading.set(false);
    });

    this.searchChanged
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => this.fetch());
  }

  onSearchInput(): void { this.searchChanged.next(); }

  setDifficulty(d: string): void { this.difficulty = d; this.fetch(); }
  setStatus(s: string): void { this.status = s; this.fetch(); }
  setTag(tag: string | null): void { this.activeTag = tag; this.fetch(); }

  hasActiveFilters(): boolean {
    return this.difficulty !== 'all' || this.status !== 'all' || !!this.search.trim() || this.activeTag !== null;
  }

  reset(): void {
    this.difficulty = 'all';
    this.status = 'all';
    this.search = '';
    this.activeTag = null;
    this._filtered.set(this._all());
  }

  fetch(): void {
    if (!this.hasActiveFilters()) {
      this._filtered.set(this._all());
      return;
    }

    this.loading.set(true);
    const filters: ProblemFilters = {
      difficulty: this.difficulty,
      status: this.status,
      search: this.search.trim() || undefined,
      tag: this.activeTag || undefined,
    };
    this.service.list(filters).subscribe({
      next: rows => {
        this._filtered.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this._filtered.set([]);
        this.loading.set(false);
      },
    });
  }

  navigate(slug: string): void {
    this.router.navigate(['/problems', slug]);
  }

  pct(solved: number, total: number): number {
    return total ? Math.round((solved / total) * 100) : 0;
  }
}
