import { Component, OnInit } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

type Theme = 'light' | 'dark';
const KEY = 'theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem(KEY, theme);
}

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent implements OnInit {
  theme: Theme = getInitialTheme();

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  ngOnInit(): void {
    applyTheme(this.theme);
  }

  toggle(): void {
    this.theme = this.isDark ? 'light' : 'dark';
    applyTheme(this.theme);
  }
}
