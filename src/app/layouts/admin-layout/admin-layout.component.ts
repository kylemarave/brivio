import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content app-main">
        <header class="app-topbar">
          <div class="flex items-center gap-3">
            <label for="admin-drawer" class="btn btn-ghost btn-square btn-sm lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div>
              <p class="text-xs text-base-content/50">Super Admin</p>
              <p class="text-sm font-semibold leading-tight">Platform Console</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 pl-1 pr-3 py-1">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-content">
                SA
              </div>
              <span class="hidden sm:inline text-sm font-medium">{{ userName() }}</span>
            </div>
            <button class="btn btn-outline btn-sm" (click)="logout()">Sign out</button>
          </div>
        </header>

        <main class="app-content">
          <router-outlet />
        </main>
      </div>

      <aside class="drawer-side z-40">
        <label for="admin-drawer" aria-label="Close sidebar" class="drawer-overlay"></label>
        <nav class="app-sidebar min-h-full">
          <div class="app-sidebar-brand">
            <div class="app-sidebar-logo">B</div>
            <div>
              <p class="text-sm font-semibold text-white">BRIVIO</p>
              <p class="text-xs text-white/50">Super Admin</p>
            </div>
          </div>

          <div class="app-sidebar-badge">
            <p class="font-medium text-white/90">Tenant Management</p>
            <p class="mt-0.5 text-white/50">Review all applications</p>
          </div>

          <div class="app-sidebar-nav">
            <p class="app-sidebar-section">Platform</p>
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="active" class="app-sidebar-link">
                <span class="text-base opacity-70">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            }
          </div>
        </nav>
      </aside>
    </div>
  `,
  host: {
    '[attr.data-theme]': '"brivio"',
  },
})
export class AdminLayoutComponent {
  readonly navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: '◫' },
    { label: 'Tenant Applications', path: '/admin/tenants', icon: '◉' },
  ];

  readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Super Admin');

  constructor(private readonly authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
