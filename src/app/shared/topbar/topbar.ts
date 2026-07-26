import { Component, inject, input } from '@angular/core';
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

  /** 'lessons' -> Lesson Admin link, 'problems' -> Problem Admin link, null -> none */
  extraNav = input<'lessons' | 'problems' | null>(null);
  showCoffeeBtn = input<boolean>(true);
}
