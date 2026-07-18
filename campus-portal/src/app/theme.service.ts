import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>(this.initial());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('up-theme', t); } catch { /* private mode */ }
    });
  }

  toggle() {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private initial(): Theme {
    try {
      const saved = localStorage.getItem('up-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* private mode */ }
    return 'light';
  }
}
