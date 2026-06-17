import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="drawer lg:drawer-open">
      <input id="tenant-drawer" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content app-main">
        <header class="app-topbar">
          <div class="flex items-center gap-3">
            <label for="tenant-drawer" class="btn btn-ghost btn-square btn-sm lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div>
              <p class="text-xs text-base-content/50">Tenant Workspace</p>
              <p class="text-sm font-semibold leading-tight">{{ tenantName() }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="hidden sm:inline-flex badge badge-outline badge-sm font-normal">{{ tenantId() }}</span>
            <div class="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 pl-1 pr-3 py-1">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-content">
                {{ userInitials() }}
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
        <label for="tenant-drawer" aria-label="Close sidebar" class="drawer-overlay"></label>
        <nav class="app-sidebar app-sidebar--tenant min-h-full">
          <div class="app-sidebar-brand">
            <div class="app-sidebar-logo">{{ tenantInitial() }}</div>
            <div>
              <p class="text-sm font-semibold text-white">{{ tenantName() }}</p>
              <p class="text-xs text-white/50">Store Console</p>
            </div>
          </div>

          <div class="app-sidebar-nav">
            <p class="app-sidebar-section">Store</p>
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
export class TenantLayoutComponent {
  readonly navItems = [
    { label: 'Dashboard', path: '/tenant/dashboard', icon: '◫' },
    { label: 'Products', path: '/tenant/products', icon: '☕' },
    { label: 'Orders', path: '/tenant/orders', icon: '◧' },
    { label: 'Store Profile', path: '/tenant/store', icon: '◉' },
  ];

  readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Owner');
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? '');
  readonly tenantName = computed(() => {
    const id = this.tenantId();
    return id ? (this.mockDataService.getTenantById(id)?.name ?? 'My Store') : 'My Store';
  });
  readonly tenantInitial = computed(() => this.tenantName().charAt(0).toUpperCase());
  readonly userInitials = computed(() => {
    const name = this.userName();
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  constructor(
    private readonly authService: AuthService,
    private readonly mockDataService: MockDataService,
  ) {}

  logout(): void {
    this.authService.logout();
  }
}
