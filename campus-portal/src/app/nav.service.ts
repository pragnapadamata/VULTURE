import { Injectable, signal } from '@angular/core';

export type Role = 'landing' | 'login' | 'student' | 'company' | 'admin';

const DEFAULT_PAGE: Record<string, string> = {
  student: 'dashboard',
  company: 'dashboard',
  admin: 'dashboard',
};

@Injectable({ providedIn: 'root' })
export class NavService {
  role = signal<Role>('landing');
  page = signal<string>('dashboard');

  constructor() {
    window.addEventListener('popstate', (e: PopStateEvent) => {
      const st = e.state as { role?: Role; page?: string } | null;
      this.role.set(st?.role ?? 'landing');
      this.page.set(st?.page ?? DEFAULT_PAGE[st?.role ?? ''] ?? 'dashboard');
    });
    history.replaceState({ role: 'landing' }, '', location.pathname);
  }

  go(role: Role, page?: string) {
    const p = page ?? DEFAULT_PAGE[role] ?? 'dashboard';
    this.role.set(role);
    this.page.set(p);
    history.pushState({ role, page: p }, '', location.pathname + '#' + (role === 'landing' ? '' : role));
  }

  goPage(page: string) {
    this.page.set(page);
    history.pushState({ role: this.role(), page }, '', location.pathname + '#' + this.role() + '/' + page);
  }
}
