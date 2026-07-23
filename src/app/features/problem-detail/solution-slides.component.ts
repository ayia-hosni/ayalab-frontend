import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-solution-slides',
  standalone: true,
  template: `<div #mount dir="ltr" style="width:100%;min-height:100vh;"></div>`,
})
export class SolutionSlidesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mount') mountRef!: ElementRef<HTMLDivElement>;
  private root: any;

  async ngAfterViewInit(): Promise<void> {
    const [{ default: React }, { default: ReactDOM }, { default: App }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('./solution-slides-react'),
    ]);
    this.root = ReactDOM.createRoot(this.mountRef.nativeElement);
    this.root.render(React.createElement(App));
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }
}
