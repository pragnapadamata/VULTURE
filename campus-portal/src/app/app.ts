import { Component, computed, inject, signal } from '@angular/core';
import { LandingView } from './landing-view';
import { LoginView } from './login-view';
import { StudentView } from './student-view';
import { CompanyView } from './company-view';
import { AdminView } from './admin-view';
import { NotificationBell } from './notification-bell';
import { ToastService } from './toast.service';
import { ThemeService } from './theme.service';
import { NavService } from './nav.service';

interface NavItem { page: string; icon: string; label: string; }

const NAV: Record<string, NavItem[]> = {
  student: [
    { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { page: 'browse', icon: '💼', label: 'Find Jobs' },
    { page: 'applications', icon: '📄', label: 'My Applications' },
    { page: 'interviews', icon: '📅', label: 'Interviews' },
    { page: 'messages', icon: '💬', label: 'Messages' },
    { page: 'saved', icon: '🔖', label: 'Saved Jobs' },
    { page: 'profile', icon: '👤', label: 'Profile' },
    { page: 'settings', icon: '⚙️', label: 'Settings' },
  ],
  company: [
    { page: 'dashboard', icon: '📊', label: 'Dashboard' },
    { page: 'jobs', icon: '💼', label: 'Job Postings' },
    { page: 'apps', icon: '📄', label: 'Applications' },
    { page: 'shortlisted', icon: '⭐', label: 'Shortlisted' },
    { page: 'interviews', icon: '📅', label: 'Interviews' },
    { page: 'offers', icon: '✉️', label: 'Offers' },
    { page: 'candidates', icon: '👥', label: 'Candidates' },
    { page: 'profile', icon: '🏢', label: 'Company Profile' },
    { page: 'reports', icon: '📈', label: 'Reports' },
    { page: 'settings', icon: '⚙️', label: 'Settings' },
  ],
  admin: [
    { page: 'dashboard', icon: '📊', label: 'Dashboard' },
    { page: 'students', icon: '👥', label: 'Students' },
    { page: 'companies', icon: '🏢', label: 'Companies' },
    { page: 'drives', icon: '💼', label: 'Placement Drives' },
    { page: 'applications', icon: '📄', label: 'Applications' },
    { page: 'interviews', icon: '📅', label: 'Interviews' },
    { page: 'offers', icon: '✉️', label: 'Offers' },
    { page: 'analytics', icon: '📈', label: 'Reports & Analytics' },
    { page: 'notifications', icon: '🔔', label: 'Notifications' },
    { page: 'settings', icon: '⚙️', label: 'Placement Settings' },
    { page: 'roles', icon: '👥', label: 'Users & Roles' },
    { page: 'logs', icon: '📑', label: 'Audit Logs' },
    { page: 'queue', icon: '📋', label: 'Approval Queue' },
  ],
};

@Component({
  selector: 'app-root',
  imports: [LandingView, LoginView, StudentView, CompanyView, AdminView, NotificationBell],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  toastService = inject(ToastService);
  themeService = inject(ThemeService);
  nav = inject(NavService);
  collapsed = signal(false);
  logoOk = signal(true);
  useInitials = signal(false);

  navItems = computed<NavItem[]>(() => NAV[this.nav.role()] ?? []);

  profileName = computed(() => {
    switch (this.nav.role()) {
      case 'student': return 'Manogna';
      case 'company': return 'Tech Solutions Inc.';
      case 'admin': return 'Dr. Ananya';
      default: return '';
    }
  });

  profileInitials = computed(() =>
    this.profileName().split(' ').map(w => w[0]).slice(0, 2).join(''));

  toggleSidebar() {
    this.collapsed.update(c => !c);
  }
}
