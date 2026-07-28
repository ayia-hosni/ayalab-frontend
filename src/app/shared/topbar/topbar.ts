import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
})
export class Topbar {
  lang = inject(LanguageService);
  theme = inject(ThemeService);
  private host = inject(ElementRef<HTMLElement>);

  /** 'lessons' -> Lesson Admin link, 'problems' -> Problem Admin link, null -> none */
  extraNav = input<'lessons' | 'problems' | null>(null);
  showCoffeeBtn = input<boolean>(true);

  langMenuOpen = signal(false);

  toggleLangMenu(): void {
    this.langMenuOpen.update(v => !v);
  }

  chooseLang(l: 'en' | 'ar'): void {
    this.lang.set(l);
    this.langMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (this.langMenuOpen() && !this.host.nativeElement.contains(e.target as Node)) {
      this.langMenuOpen.set(false);
    }
  }
}
