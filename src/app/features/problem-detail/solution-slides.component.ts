import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-solution-slides',
  standalone: true,
  template: `<div #mount dir="ltr" style="width:100%;min-height:100vh;"></div>`,
})
export class SolutionSlidesComponent implements AfterViewInit, OnDestroy {
  /** Raw JSON string from ProblemDetail.gameConfigs.solutionSlides. `kind: 'tree'` routes to
   *  recursion-tree-engine.tsx; everything else (chain/array-shaped problems) uses
   *  chain-trace-engine.tsx in 'slides' mode — see each engine's config shape comment. */
  @Input() config: string | null | undefined;
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
    if (!this.config) return;
    const parsedConfig = JSON.parse(this.config);
    const loadModule = parsedConfig.kind === 'tree'
      ? () => import('./recursion-tree-engine')
      : () => import('./chain-trace-engine');
    const [{ default: React }, { default: ReactDOM }, { default: App }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      loadModule(),
    ]);
    this.React = React;
    this.App = App;
    this.root = ReactDOM.createRoot(this.mountRef.nativeElement);
    this.renderApp(this.siteLang.isAr);
  }

  private renderApp(isAr: boolean): void {
    const config = JSON.parse(this.config!);
    const initialTechnique = this.route.snapshot.queryParamMap.get('technique') === 'recursive' ? 'recursive' : 'iterative';
    const onTechniqueChange = (t: string) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { technique: t === 'iterative' ? null : t },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    };
    this.root.render(this.React.createElement(this.App, { config, initialTechnique, onTechniqueChange, isAr }));
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }
}
