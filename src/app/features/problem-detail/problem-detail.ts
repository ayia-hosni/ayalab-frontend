import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { ProblemService } from '../../core/services/problem.service';
import {
  ProblemDetail as ProblemDetailModel,
  SubmitResult,
} from '../../core/models/problem.models';
import { PointerSandboxComponent } from './pointer-sandbox.component';

type Lang = 'javascript' | 'python' | 'java';

interface TraceStep {
  prev: number | null;
  curr: number | null;
  next: number | null;
  reversed: boolean[];
  line: string;
  badge: string;
  desc: string;
  done: boolean;
}

interface GameQuestion {
  text: string;
  hint: string;
  explain: string;
  correct: string;
  correctOrigIdx: number | 'null';
  hidePointer?: 'prev' | 'curr' | 'next';
  pointerLabel: string;
  pointerColor: string;
  pointerTextColor: string;
  badge: string;
  step: TraceStep;
}

type GamePhase = 'question' | 'correct' | 'wrong' | 'complete';

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PointerSandboxComponent],
  templateUrl: './problem-detail.html',
  styleUrl: './problem-detail.css',
})
export class ProblemDetail implements OnInit {
  private service = inject(ProblemService);
  private route = inject(ActivatedRoute);

  problem = signal<ProblemDetailModel | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  activeTab = signal<1 | 2 | 3 | 4>(1);
  lang = signal<Lang>('javascript');

  code = signal<string>('');
  private starter: Record<string, string> | null = null;

  running = signal<boolean>(false);
  result = signal<SubmitResult | null>(null);

  // visualizer state
  listInput = '1, 2, 3, 4';
  values = signal<number[]>([]);
  steps = signal<TraceStep[]>([]);
  stepIndex = signal<number>(0);
  playing = signal<boolean>(false);
  voiceEnabled = signal<boolean>(false);
  playSpeed = signal<1000 | 2000>(2000);
  private playTimer: any = null;

  // game state
  gameStepIndex  = signal<number>(0);
  gamePhase      = signal<GamePhase>('question');
  gameScore      = signal<number>(0);
  gameTries      = signal<number>(0);
  gameHintShown       = signal<boolean>(false);
  gameSelectedOrigIdx = signal<number | 'null' | null>(null);
  isDragging          = signal<boolean>(false);
  dragOverIdx         = signal<number | 'null' | null>(null);
  gameQuestions = signal<GameQuestion[]>([]);

  private readonly RAMP        = ['#FF9F43','#A55EEA','#1DD1A1','#FF6B6B','#00D2D3','#FECA57','#54A0FF'];
  private readonly RAMP_SHADOW = ['#E1700F','#7B3BB5','#0A7A5D','#C0392B','#00B894','#F39C12','#2E86DE'];
  private readonly RAMP_BG     = ['#FFF0E1','#F3EEFF','#E3F8EB','#FFE4E4','#E0F7F5','#FFF5E0','#E3F2FD'];

  readonly BADGE_ORDER = ['init', '1', '2', '3', 'done'];

  currentStep = computed<TraceStep | null>(() => {
    const s = this.steps();
    return s.length ? s[this.stepIndex()] : null;
  });

  prevIdx  = computed<number | null>(() => this.currentStep()?.prev  ?? null);
  currIdx  = computed<number | null>(() => this.currentStep()?.curr  ?? null);
  nextIdx  = computed<number | null>(() => this.currentStep()?.next  ?? null);

  vizViewBox      = computed(() => `0 0 ${Math.max(this.values().length, 1) * 110 + 80} 220`);
  miniViewBox     = computed(() => `0 0 ${Math.max(this.values().length, 1) * 110 + 80} 110`);
  isAnswerReached = computed(() => this.currentStep()?.done ?? false);
  reversedValues  = computed(() => [...this.values()].reverse());

  badgeTicks = computed(() => {
    const steps = this.steps();
    const total = steps.length;
    if (total <= 1) return [] as Array<{ pct: number; badge: string; color: string }>;
    const seen = new Set<string>();
    return steps
      .map((s, i) => {
        if (!seen.has(s.badge)) {
          seen.add(s.badge);
          return { pct: (i / (total - 1)) * 100, badge: s.badge, color: this.BADGE_COLORS[s.badge] };
        }
        return null;
      })
      .filter((x): x is { pct: number; badge: string; color: string } => x !== null);
  });
  answerHeadValue = computed(() => { const v = this.values(); return v.length > 0 ? v[v.length - 1] : null; });

  // Reconstruct the per-node link targets for the current step.
  // reversed[i] = true means node i's arrow has been flipped backward.
  private getStepLinks(step: TraceStep): Array<number | null> {
    const n = this.values().length;
    return Array.from({ length: n }, (_, i) => {
      if (step.reversed[i]) return i > 0 ? i - 1 : null;
      return i < n - 1 ? i + 1 : null;
    });
  }

  // Display order at each step: follow the reversed chain from prev (already-reversed
  // nodes slide left), then the unreversed chain from curr — exactly like getCombinedChain
  // in pointer_lab.html. This makes nodes physically reposition as the algorithm runs.
  traceChain = computed((): number[] => {
    const s   = this.currentStep();
    const n   = this.values().length;
    if (n === 0) return [];
    if (!s)      return Array.from({ length: n }, (_, i) => i);

    const links   = this.getStepLinks(s);
    const visited = new Set<number>();

    const follow = (start: number | null): number[] => {
      const chain: number[] = [];
      let node = start;
      while (node !== null && !visited.has(node)) {
        visited.add(node); chain.push(node); node = links[node];
      }
      return chain;
    };

    const combined = [...follow(s.prev), ...follow(s.curr)];
    // Safety net: add any node not yet placed (shouldn't happen in practice)
    for (let i = 0; i < n; i++) if (!combined.includes(i)) combined.push(i);
    return combined;
  });

  // Values in chain (display) order
  traceValues = computed(() => this.traceChain().map(i => this.values()[i]));

  // Original node index at display position i (for color / pointer lookup)
  traceOrigIdx(i: number): number { return this.traceChain()[i] ?? i; }

  // Display position of a pointer (for flag X positioning)
  traceDisplayPos(origIdx: number | null): number | null {
    if (origIdx === null) return null;
    const pos = this.traceChain().indexOf(origIdx);
    return pos >= 0 ? pos : null;
  }

  // Whether adjacent display positions are actually linked — determines if an arrow is drawn.
  // When they ARE linked the arrow always goes left→right because the chain follows link order.
  traceArrowExists(displayIdx: number): boolean {
    const s = this.currentStep();
    const chain = this.traceChain();
    if (!s || displayIdx >= chain.length - 1) return false;
    return this.getStepLinks(s)[chain[displayIdx]] === chain[displayIdx + 1];
  }

  stageText    = computed(() => this.currentStep()?.desc ?? '');
  stageCounter = computed(() => {
    const total = this.steps().length;
    return total ? `Step ${this.stepIndex() + 1} / ${total}` : '';
  });
  progressPct  = computed(() => {
    const total = this.steps().length;
    return total > 1 ? (this.stepIndex() / (total - 1)) * 100 : 0;
  });
  speedLabel   = computed(() => this.playSpeed() === 1000 ? '⚡ Fast' : '🐢 Normal');
  badgeClass   = computed(() => `badge--${this.currentStep()?.badge ?? 'init'}`);
  stageClass   = computed(() => `stage--${this.currentStep()?.badge ?? 'init'}`);

  currentGameQ  = computed<GameQuestion | null>(() => this.gameQuestions()[this.gameStepIndex()] ?? null);
  gameTotalQ    = computed(() => this.gameQuestions().length);
  gameProgress  = computed(() => {
    const t = this.gameTotalQ();
    return t ? Math.round((this.gameStepIndex() / t) * 100) : 0;
  });
  gameScorePct  = computed(() => {
    const t = this.gameTotalQ();
    return t ? Math.round((this.gameScore() / t) * 100) : 0;
  });

  currentGameStep = computed<TraceStep | null>(() => this.currentGameQ()?.step ?? null);
  gamePrevIdx     = computed<number | null>(() => this.currentGameStep()?.prev ?? null);
  gameCurrIdx     = computed<number | null>(() => this.currentGameStep()?.curr ?? null);
  gameNextIdx     = computed<number | null>(() => this.currentGameStep()?.next ?? null);

  gameTraceChain = computed((): number[] => {
    const s = this.currentGameStep();
    const n = this.values().length;
    if (n === 0) return [];
    if (!s) return Array.from({ length: n }, (_, i) => i);
    const links = this.getStepLinks(s);
    const visited = new Set<number>();
    const follow = (start: number | null): number[] => {
      const chain: number[] = [];
      let node = start;
      while (node !== null && !visited.has(node)) { visited.add(node); chain.push(node); node = links[node]; }
      return chain;
    };
    const combined = [...follow(s.prev), ...follow(s.curr)];
    for (let i = 0; i < n; i++) if (!combined.includes(i)) combined.push(i);
    return combined;
  });

  gameTraceValues = computed(() => this.gameTraceChain().map(i => this.values()[i]));

  gameTraceOrigIdx(i: number): number { return this.gameTraceChain()[i] ?? i; }
  gameTraceDisplayPos(origIdx: number | null): number | null {
    if (origIdx === null) return null;
    const pos = this.gameTraceChain().indexOf(origIdx);
    return pos >= 0 ? pos : null;
  }
  gameTraceArrowExists(di: number): boolean {
    const s = this.currentGameStep();
    const chain = this.gameTraceChain();
    if (!s || di >= chain.length - 1) return false;
    return this.getStepLinks(s)[chain[di]] === chain[di + 1];
  }

  // ── Per-step technique definitions ────────────────────────────────────────
  readonly BADGE_COLORS: Record<string, string> = {
    'init': '#00D2D3',
    '1':    '#FECA57',
    '2':    '#FF5252',
    '3':    '#00D2D3',
    'done': '#A55EEA',
  };

  readonly STEP_TECHNIQUE: Record<string, { icon: string; name: string; desc: string }> = {
    'init': { icon: '🎯', name: 'Initialize Pointers',   desc: "Place prev at null and curr at the head — the three-pointer setup before the loop starts." },
    '1':    { icon: '💾', name: 'Save the Forward Link', desc: "Store curr.next before overwriting it. Without this save, the rest of the list would be lost forever." },
    '2':    { icon: '🔄', name: 'Reverse the Arrow',     desc: "Point curr.next backward at prev. This single line IS the reversal — one arrow flipped per node." },
    '3':    { icon: '➡️', name: 'Slide Both Pointers',   desc: "Move prev and curr one step forward. The reversed portion grows; the remaining list shrinks." },
    'done': { icon: '🏁', name: 'Return the New Head',   desc: "curr reached null — the loop ends. prev now sits at the original tail, which is the new head." },
  };

  gameActiveLineBg = computed(() => {
    const c = this.currentGameQ()?.pointerColor;
    if (!c) return 'transparent';
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.14)`;
  });

  // ── Technique explorer (code column) ──────────────────────────────────────
  activeTechnique = signal<string | null>(null);

  selectTechnique(badge: string): void {
    this.activeTechnique.set(this.activeTechnique() === badge ? null : badge);
  }

  jumpToBadge(badge: string): void {
    const idx = this.steps().findIndex(s => s.badge === badge);
    if (idx >= 0) { this.stepIndex.set(idx); this.stopPlay(); }
  }

  activeTechniqueColor = computed(() => this.BADGE_COLORS[this.activeTechnique() ?? ''] ?? '#B2BEC3');

  activeTechniqueBg = computed(() => {
    const c = this.activeTechniqueColor();
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.1)`;
  });

  techChipTextColor(badge: string): string {
    return this.BADGE_COLORS[badge] === '#FECA57' ? '#5A3E00' : '#FFF';
  }

  // ── Code-Walk (completion screen interactive code panel) ──────────────────
  readonly CODE_LINES: { code: string; badge: string | null }[] = [
    { code: 'function reverse(head) {',         badge: null   },
    { code: '  let prev = null, curr = head;',  badge: 'init' },
    { code: '  while (curr !== null) {',        badge: null   },
    { code: '    let next = curr.next;',        badge: '1'    },
    { code: '    curr.next = prev;',            badge: '2'    },
    { code: '    prev = curr;  curr = next;',   badge: '3'    },
    { code: '  }',                              badge: null   },
    { code: '  return prev;',                   badge: 'done' },
    { code: '}',                                badge: null   },
  ];

  codeWalkLineIdx    = signal<number>(1);
  codeWalkExampleIdx = signal<number>(0);

  codeWalkActiveBadge = computed(() => this.CODE_LINES[this.codeWalkLineIdx()]?.badge ?? null);
  codeWalkBadgeSteps  = computed(() => {
    const badge = this.codeWalkActiveBadge();
    if (!badge) return [] as number[];
    return this.steps().reduce<number[]>((acc, s, i) => { if (s.badge === badge) acc.push(i); return acc; }, []);
  });
  codeWalkStepIdx = computed(() => this.codeWalkBadgeSteps()[this.codeWalkExampleIdx()] ?? 0);
  codeWalkStep    = computed<TraceStep | null>(() => this.steps()[this.codeWalkStepIdx()] ?? null);
  codeWalkPrevIdx = computed<number | null>(() => this.codeWalkStep()?.prev ?? null);
  codeWalkCurrIdx = computed<number | null>(() => this.codeWalkStep()?.curr ?? null);
  codeWalkNextIdx = computed<number | null>(() => this.codeWalkStep()?.next ?? null);
  codeWalkChain   = computed((): number[] => {
    const s = this.codeWalkStep(), n = this.values().length;
    if (n === 0) return [];
    if (!s) return Array.from({ length: n }, (_, i) => i);
    const links = this.getStepLinks(s), visited = new Set<number>();
    const follow = (start: number | null): number[] => {
      const chain: number[] = []; let node = start;
      while (node !== null && !visited.has(node)) { visited.add(node); chain.push(node); node = links[node]; }
      return chain;
    };
    const combined = [...follow(s.prev), ...follow(s.curr)];
    for (let i = 0; i < n; i++) if (!combined.includes(i)) combined.push(i);
    return combined;
  });
  codeWalkValues  = computed(() => this.codeWalkChain().map(i => this.values()[i]));
  codeWalkExLabel = computed(() => {
    const t = this.codeWalkBadgeSteps().length;
    return t > 1 ? `Example ${this.codeWalkExampleIdx() + 1} / ${t}` : '';
  });

  selectCodeLine(idx: number): void {
    if (!this.CODE_LINES[idx]?.badge) return;
    this.codeWalkLineIdx.set(idx);
    this.codeWalkExampleIdx.set(0);
  }
  codeWalkPrevEx(): void { this.codeWalkExampleIdx.update(i => Math.max(0, i - 1)); }
  codeWalkNextEx(): void { this.codeWalkExampleIdx.update(i => Math.min(i + 1, this.codeWalkBadgeSteps().length - 1)); }
  codeWalkOrigIdx(i: number): number { return this.codeWalkChain()[i] ?? i; }
  codeWalkDisplayPos(origIdx: number | null): number | null {
    if (origIdx === null) return null;
    const pos = this.codeWalkChain().indexOf(origIdx);
    return pos >= 0 ? pos : null;
  }
  codeWalkArrowExists(di: number): boolean {
    const s = this.codeWalkStep(), chain = this.codeWalkChain();
    if (!s || di >= chain.length - 1) return false;
    return this.getStepLinks(s)[chain[di]] === chain[di + 1];
  }

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
        if (p.starterCode && Object.keys(p.starterCode).length > 0) {
          this.starter = p.starterCode;
          this.code.set(this.starter['javascript'] ?? '');
        }
        this.loading.set(false);
        this.buildTrace();
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  showTab(n: 1 | 2 | 3 | 4): void { this.activeTab.set(n); }

  showLang(l: Lang): void {
    this.lang.set(l);
    if (this.starter) this.code.set(this.starter[l] ?? '');
  }

  get readOnlyCode(): boolean { return this.lang() !== 'javascript'; }

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
      .submit(p.slug, { language: 'javascript', code: this.code(), submit })
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

  // ================== Game ==================

  private buildGameQuestions(vals: number[], steps: TraceStep[]): void {
    const fmt = (idx: number | null): string => idx === null ? 'null' : String(vals[idx]);
    const toOrigIdx = (idx: number | null): number | 'null' => idx === null ? 'null' : idx;

    const questions = steps
      .filter(s => s.badge !== '3')
      .map((s): GameQuestion => {
        let text = '', hint = '', explain = '', correct = '';
        let correctOrigIdx: number | 'null' = 'null';
        let hidePointer: 'prev' | 'curr' | 'next' | undefined;
        let pointerLabel = '', pointerColor = '', pointerTextColor = '#FFF';

        if (s.badge === 'init') {
          correctOrigIdx = toOrigIdx(s.curr);
          correct = fmt(s.curr);
          hidePointer = 'curr';
          pointerLabel = 'curr'; pointerColor = '#00D2D3';
          text = `Where does curr start? Click the head node.`;
          hint = `curr always starts at the very first node — the head of the list.`;
          explain = `curr = head, so curr points at the first node (value ${correct}). Think of curr as your reading finger — it starts at the beginning.`;

        } else if (s.badge === '1') {
          correctOrigIdx = toOrigIdx(s.next);
          correct = fmt(s.next);
          hidePointer = 'next';
          pointerLabel = 'next'; pointerColor = '#FECA57'; pointerTextColor = '#2D3436';
          const currVal = s.curr !== null ? vals[s.curr] : '?';
          text = `curr is at ${currVal}. Where does next point after next = curr.next?`;
          hint = `curr.next is the node immediately to the right of curr in the chain.`;
          explain = `next saves ${correct === 'null' ? 'null — curr was the last node' : `node ${correct}`}. We save it FIRST so we don't lose the rest of the list when we flip the arrow.`;

        } else if (s.badge === '2') {
          correctOrigIdx = toOrigIdx(s.prev);
          correct = fmt(s.prev);
          pointerLabel = 'curr.next'; pointerColor = '#FF5252';
          text = `curr is at ${s.curr !== null ? vals[s.curr] : '?'}. Follow curr's arrow — where does it now point after curr.next = prev?`;
          hint = `The arrow on curr has been flipped. Follow it to find where curr.next points now.`;
          explain = `curr.next = prev flips the arrow to ${correct === 'null' ? "null (prev was null — first iteration)" : `node ${correct}`}. This is the core reversal step!`;

        } else {
          correctOrigIdx = toOrigIdx(s.prev);
          correct = fmt(s.prev);
          hidePointer = 'prev';
          pointerLabel = 'new head'; pointerColor = '#A55EEA';
          text = `curr reached null — the loop is done. Click the new head of the reversed list.`;
          hint = `When the loop ends, prev points at the last node processed — which is now the front of the reversed list.`;
          explain = `We return prev (node ${correct}) as the new head. The whole list is now reversed!`;
        }

        return { text, hint, explain, correct, correctOrigIdx, hidePointer, pointerLabel, pointerColor, pointerTextColor, badge: s.badge, step: s };
      });
    this.gameQuestions.set(questions);
  }

  selectGameNode(origIdx: number | 'null'): void {
    if (this.gamePhase() !== 'question') return;
    const q = this.currentGameQ();
    if (!q) return;
    this.gameSelectedOrigIdx.set(origIdx);
    this.gameTries.update(t => t + 1);
    if (origIdx === q.correctOrigIdx) {
      if (this.gameTries() === 1) this.gameScore.update(s => s + 1);
      this.gamePhase.set('correct');
    } else {
      this.gameHintShown.set(true);
      this.gamePhase.set('wrong');
    }
  }

  onChipDragStart(e: DragEvent): void {
    this.isDragging.set(true);
    e.dataTransfer?.setData('text/plain', 'pointer');
  }
  onChipDragEnd(): void {
    this.isDragging.set(false);
    this.dragOverIdx.set(null);
  }
  onZoneDragOver(e: DragEvent, idx: number | 'null'): void {
    e.preventDefault();
    this.dragOverIdx.set(idx);
  }
  onZoneDragLeave(e: DragEvent): void {
    const zone = e.currentTarget as HTMLElement;
    if (!zone.contains(e.relatedTarget as Node)) this.dragOverIdx.set(null);
  }
  onZoneDrop(e: DragEvent, idx: number | 'null'): void {
    e.preventDefault();
    this.isDragging.set(false);
    this.dragOverIdx.set(null);
    this.selectGameNode(idx);
  }

  gameNodeStroke(origIdx: number): string {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question' && this.dragOverIdx() === origIdx) return q?.pointerColor ?? '#FECA57';
    if (phase !== 'question') {
      if (q && origIdx === q.correctOrigIdx) return '#00C48C';
      if (origIdx === this.gameSelectedOrigIdx()) return '#FF6B6B';
    }
    return this.nodeColor(origIdx);
  }

  gameNodeStrokeW(origIdx: number): number {
    return this.gamePhase() === 'question' && this.dragOverIdx() === origIdx ? 5 : 3;
  }

  gameNodeFill(origIdx: number): string {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question' && this.dragOverIdx() === origIdx) {
      const c = q?.pointerColor ?? '#FECA57';
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return `rgba(${r},${g},${b},0.18)`;
    }
    if (phase !== 'question') {
      if (q && origIdx === q.correctOrigIdx) return '#E8FFF4';
      if (origIdx === this.gameSelectedOrigIdx()) return '#FFF0F0';
    }
    return this.nodeBg(origIdx);
  }

  gameNodeOpacity(origIdx: number): number {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question') return 1;
    const isCorrect  = q ? origIdx === q.correctOrigIdx : false;
    const isSelected = origIdx === this.gameSelectedOrigIdx();
    return (isCorrect || isSelected) ? 1 : 0.35;
  }

  gameNullColor(): string {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question' && this.dragOverIdx() === 'null') return q?.pointerColor ?? '#FECA57';
    if (phase !== 'question' && q?.correctOrigIdx === 'null') return '#00C48C';
    if (phase === 'wrong' && this.gameSelectedOrigIdx() === 'null') return '#FF6B6B';
    return '#B2BEC3';
  }

  gameNullFill(): string {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question' && this.dragOverIdx() === 'null') {
      const c = q?.pointerColor ?? '#FECA57';
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return `rgba(${r},${g},${b},0.18)`;
    }
    if (phase !== 'question' && q?.correctOrigIdx === 'null') return '#E8FFF4';
    if (phase === 'wrong' && this.gameSelectedOrigIdx() === 'null') return '#FFF0F0';
    return 'transparent';
  }

  gameNullOpacity(): number {
    const q = this.currentGameQ();
    const phase = this.gamePhase();
    if (phase === 'question') return 1;
    if (q?.correctOrigIdx === 'null') return 1;
    if (this.gameSelectedOrigIdx() === 'null') return 1;
    return 0.35;
  }

  onSvgNodeDragLeave(e: DragEvent, idx: number | 'null'): void {
    e.preventDefault();
    if (this.dragOverIdx() === idx) this.dragOverIdx.set(null);
  }

  nextGameStep(): void {
    const next = this.gameStepIndex() + 1;
    if (next >= this.gameTotalQ()) {
      this.gamePhase.set('complete');
    } else {
      this.gameStepIndex.set(next);
      this.gamePhase.set('question');
      this.gameTries.set(0);
      this.gameHintShown.set(false);
      this.gameSelectedOrigIdx.set(null);
      this.isDragging.set(false);
      this.dragOverIdx.set(null);
    }
  }

  retryGameStep(): void {
    this.gamePhase.set('question');
    this.gameSelectedOrigIdx.set(null);
    this.isDragging.set(false);
    this.dragOverIdx.set(null);
  }

  showGameHint(): void { this.gameHintShown.set(true); }

  restartGame(): void {
    this.buildGameQuestions(this.vals, this.steps());
    this.gameStepIndex.set(0);
    this.gamePhase.set('question');
    this.gameScore.set(0);
    this.gameTries.set(0);
    this.gameHintShown.set(false);
    this.gameSelectedOrigIdx.set(null);
  }

  // ================== Visualizer ==================

  loadList(): void { this.buildTrace(); }

  private buildTrace(): void {
    const vals = this.listInput
      .split(',').map(x => x.trim()).filter(x => x.length > 0)
      .map(x => Number(x)).filter(x => !Number.isNaN(x)).slice(0, 7);

    this.vals = vals;
    this.values.set(vals);

    const n = vals.length;
    const steps: TraceStep[] = [];
    const reversed = new Array(n).fill(false);

    steps.push({
      prev: null, curr: n > 0 ? 0 : null, next: null,
      reversed: [...reversed],
      line: 'prev = null;  curr = head;',
      badge: 'init',
      desc: 'prev starts null, curr starts at the head.',
      done: n === 0,
    });

    let prev: number | null = null;
    let curr: number | null = n > 0 ? 0 : null;

    while (curr !== null) {
      const next: number | null = curr + 1 < n ? curr + 1 : null;

      steps.push({
        prev, curr, next, reversed: [...reversed],
        line: 'next = curr.next;',
        badge: '1',
        desc: 'Save the next node before we break the link.',
        done: false,
      });

      reversed[curr] = true;
      steps.push({
        prev, curr, next, reversed: [...reversed],
        line: 'curr.next = prev;',
        badge: '2',
        desc: 'Flip the arrow — curr now points back at prev.',
        done: false,
      });

      prev = curr; curr = next;
      steps.push({
        prev, curr, next, reversed: [...reversed],
        line: 'prev = curr;  curr = next;',
        badge: '3',
        desc: 'Slide both pointers forward.',
        done: false,
      });
    }

    steps.push({
      prev, curr: null, next: null, reversed: [...reversed],
      line: 'return prev;',
      badge: 'done',
      desc: 'curr is null — return prev as the new head!',
      done: true,
    });

    this.steps.set(steps);
    this.stepIndex.set(0);
    this.stopPlay();
    this.restartGame();
  }

  private vals: number[] = [];

  step(delta: number): void {
    const next = this.stepIndex() + delta;
    if (next >= 0 && next < this.steps().length) {
      this.stepIndex.set(next);
      this.speak(this.currentStep()?.desc ?? '');
    }
    if (next >= this.steps().length - 1) this.stopPlay();
  }

  togglePlay(): void {
    if (this.playing()) {
      this.stopPlay();
    } else {
      this.playing.set(true);
      this.speak(this.currentStep()?.desc ?? '');
      this.playTimer = setInterval(() => {
        if (this.stepIndex() < this.steps().length - 1) {
          this.stepIndex.set(this.stepIndex() + 1);
          this.speak(this.currentStep()?.desc ?? '');
        } else {
          this.stopPlay();
        }
      }, this.playSpeed());
    }
  }

  toggleSpeed(): void {
    const wasPlaying = this.playing();
    if (wasPlaying) this.stopPlay();
    this.playSpeed.set(this.playSpeed() === 2000 ? 1000 : 2000);
    if (wasPlaying) this.togglePlay();
  }

  restart(): void {
    this.stepIndex.set(0);
    this.stopPlay();
  }

  scrubTo(i: number): void {
    this.stepIndex.set(Math.max(0, Math.min(i, this.steps().length - 1)));
    this.speak(this.currentStep()?.desc ?? '');
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.activeTab() !== 2) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); this.step(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); this.step(-1); }
    if (e.key === ' ')          { e.preventDefault(); this.togglePlay(); }
    if (e.key === 'Home')       { e.preventDefault(); this.restart(); }
  }

  private stopPlay(): void {
    this.playing.set(false);
    if (this.playTimer) { clearInterval(this.playTimer); this.playTimer = null; }
  }

  toggleVoice(): void {
    const next = !this.voiceEnabled();
    this.voiceEnabled.set(next);
    if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  private speak(text: string): void {
    if (!this.voiceEnabled() || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }

  // SVG helpers
  nodeX(i: number): number  { return 40 + i * 110; }
  nodeCx(i: number): number { return this.nodeX(i) + 26; }
  nodeColor(i: number):  string { return this.RAMP[i % this.RAMP.length]; }
  nodeShadow(i: number): string { return this.RAMP_SHADOW[i % this.RAMP_SHADOW.length]; }
  nodeBg(i: number):     string { return this.RAMP_BG[i % this.RAMP_BG.length]; }

  pointerLabel(role: 'prev' | 'curr' | 'next', i: number): boolean {
    const s = this.currentStep();
    if (!s) return false;
    return s[role] === i;
  }

  reversedOrigIdx(pos: number): number { return this.values().length - 1 - pos; }
}