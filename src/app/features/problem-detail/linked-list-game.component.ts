import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-linked-list-game',
  standalone: true,
  template: `<div #mount dir="ltr" style="width:100%;min-height:100vh;"></div>`,
})
export class LinkedListGameComponent implements AfterViewInit, OnDestroy {
  /** Raw JSON string from ProblemDetail.gameConfigs.traceGame — see chain-trace-engine.tsx. */
  @Input() config: string | null | undefined;
  /** Fallback for problems with no config row: a hand-written component (see legacy-games.ts). Props: { isAr }. */
  @Input() legacy: (() => Promise<{ default: any }>) | null | undefined;
  @ViewChild('mount') mountRef!: ElementRef<HTMLDivElement>;
  private root: any;
  private React: any;
  private App: any;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private siteLang = inject(LanguageService);

  constructor() {
    effect(() => {
      const isAr = this.siteLang.isAr;
      if (this.root) this.renderApp(isAr);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.config && !this.legacy) return;
    const [{ default: React }, { default: ReactDOM }, { default: App }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      this.config ? import('./chain-trace-engine') : this.legacy!(),
    ]);
    this.React = React;
    this.App = App;
    this.root = ReactDOM.createRoot(this.mountRef.nativeElement);
    this.renderApp(this.siteLang.isAr);
  }

  private renderApp(isAr: boolean): void {
    const initialTechnique = this.route.snapshot.queryParamMap.get('technique') === 'recursive' ? 'recursive' : 'iterative';
    const onTechniqueChange = (t: string) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { technique: t === 'iterative' ? null : t },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    };
    // Hand-written components take the same technique/language props as the generic engines, minus config.
    const props = this.config
      ? { config: JSON.parse(this.config), initialTechnique, onTechniqueChange, isAr }
      : { initialTechnique, onTechniqueChange, isAr };
    this.root.render(this.React.createElement(this.App, props));
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }
}
