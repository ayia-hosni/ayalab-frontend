import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

const MODULE_BY_SLUG: Record<string, () => Promise<{ default: any }>> = {
  'reverse-linked-list': () => import('./move-pointer-react'),
  'remove-linked-list-elements': () => import('./move-pointer-remove-elements-react'),
  'palindrome-linked-list': () => import('./move-pointer-palindrome-react'),
};

@Component({
  selector: 'app-move-pointer',
  standalone: true,
  template: `<div #mount dir="ltr" style="width:100%;min-height:100vh;"></div>`,
})
export class MovePointerComponent implements AfterViewInit, OnDestroy {
  @Input() problemSlug = 'reverse-linked-list';
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
    const loadModule = MODULE_BY_SLUG[this.problemSlug] ?? MODULE_BY_SLUG['reverse-linked-list'];
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
    const initialTechnique = this.route.snapshot.queryParamMap.get('technique') === 'recursive' ? 'recursive' : 'iterative';
    const onTechniqueChange = (t: string) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { technique: t === 'iterative' ? null : t },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    };
    this.root.render(this.React.createElement(this.App, { initialTechnique, onTechniqueChange, isAr }));
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }
}
