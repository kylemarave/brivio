import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AdminTenantService } from '../../features/admin/services/admin-tenant.service';

interface NavGroup {
  section: string;
  items: { label: string; path: string; icon: string }[];
}

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

          @for (group of navGroups; track group.section) {
            <div class="app-sidebar-nav">
              <p class="app-sidebar-section">{{ group.section }}</p>
              @for (item of group.items; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active" class="app-sidebar-link">
                  <span class="text-base opacity-70">{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              }
            </div>
          }
        </nav>
      </aside>
    </div>
  `,
  host: {
    '[attr.data-theme]': '"brivio"',
  },
})
export class TenantLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminTenantService = inject(AdminTenantService);

  readonly tenantName = signal('My Store');

  readonly navGroups: NavGroup[] = [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', path: '/tenant/dashboard', icon: '◫' }],
    },
    {
      section: 'Catalog',
      items: [
        { label: 'Products', path: '/tenant/products', icon: '☕' },
        { label: 'Categories', path: '/tenant/categories', icon: '▦' },
        { label: 'Variants', path: '/tenant/variants', icon: '◈' },
        { label: 'Add-ons', path: '/tenant/addons', icon: '＋' },
      ],
    },
    {
      section: 'Sales',
      items: [
        { label: 'Orders', path: '/tenant/orders', icon: '◧' },
        { label: 'Customers', path: '/tenant/customers', icon: '◉' },
        { label: 'Loyalty', path: '/tenant/loyalty', icon: '★' },
      ],
    },
    {
      section: 'Operations',
      items: [
        { label: 'Inventory', path: '/tenant/inventory', icon: '▤' },
        { label: 'Suppliers', path: '/tenant/suppliers', icon: '⛟' },
      ],
    },
    {
      section: 'People',
      items: [
        { label: 'Employees', path: '/tenant/employees', icon: '👤' },
        { label: 'Attendance', path: '/tenant/attendance', icon: '⏱' },
        { label: 'Schedule', path: '/tenant/schedule', icon: '📅' },
      ],
    },
    {
      section: 'Finance',
      items: [
        { label: 'Payments', path: '/tenant/payments', icon: '💳' },
        { label: 'Reports', path: '/tenant/reports', icon: '📊' },
      ],
    },
    {
      section: 'Marketing',
      items: [
        { label: 'Promotions', path: '/tenant/promotions', icon: '🏷' },
        { label: 'Coupons', path: '/tenant/coupons', icon: '🎟' },
      ],
    },
    {
      section: 'Settings',
      items: [
        { label: 'Store Profile', path: '/tenant/store', icon: '🏪' },
        { label: 'Settings', path: '/tenant/settings', icon: '⚙' },
      ],
    },
  ];

  readonly userName = computed(() => this.authService.currentUser()?.name ?? 'Owner');
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? '');
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

  ngOnInit(): void {
    const id = this.tenantId();
    if (!id) return;
    this.adminTenantService.getTenant(id).subscribe({
      next: (t) => this.tenantName.set(t.name),
      error: () => this.tenantName.set('My Store'),
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
