import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminDashboardStats, EntityStatus, Tenant } from '../../core/models';
import { AdminTenantService } from './services/admin-tenant.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <section>
      <header class="page-header">
        <h1>Platform Overview</h1>
        <p>Summary of tenant applications and active workspaces.</p>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <p class="kpi-card-label">Pending Applications</p>
          <p class="kpi-card-value text-warning">{{ stats()?.pendingApplications ?? 0 }}</p>
          <p class="kpi-card-desc">Awaiting your review</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Active Tenants</p>
          <p class="kpi-card-value text-success">{{ stats()?.activeTenants ?? 0 }}</p>
          <p class="kpi-card-desc">Approved and operating</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Inactive</p>
          <p class="kpi-card-value text-error">{{ stats()?.inactiveTenants ?? 0 }}</p>
          <p class="kpi-card-desc">Suspended or rejected</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Total Records</p>
          <p class="kpi-card-value">{{ stats()?.totalTenants ?? 0 }}</p>
          <p class="kpi-card-desc">All tenant applications</p>
        </div>
      </div>

      <div class="panel mt-6">
        <div class="panel-header">
          <h2>Recent Applications</h2>
          <a routerLink="/admin/tenants" class="btn btn-ghost btn-xs">View all</a>
        </div>
        <div class="panel-body overflow-x-auto p-0">
          <table class="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of recentTenants(); track tenant.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/admin/tenants', tenant.id]" class="flex items-center gap-3 font-semibold hover:text-primary">
                      <span class="tenant-row-avatar">{{ tenant.name.charAt(0) }}</span>
                      {{ tenant.name }}
                    </a>
                  </td>
                  <td>{{ tenant.email }}</td>
                  <td>{{ tenant.plan }}</td>
                  <td><span class="badge badge-sm" [ngClass]="statusBadge(tenant.status)">{{ tenant.status }}</span></td>
                  <td>{{ tenant.createdAt | date: 'MMM d, y' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminTenantService);
  readonly stats = signal<AdminDashboardStats | null>(null);
  readonly recentTenants = signal<Tenant[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.adminService.getDashboardStats().subscribe((s) => this.stats.set(s));
    this.adminService.listTenants().subscribe((t) => this.recentTenants.set(t.slice(0, 5)));
  }

  statusBadge(status: EntityStatus): Record<string, boolean> {
    return {
      'badge-warning': status === 'PENDING',
      'badge-success': status === 'ACTIVE',
      'badge-ghost': status === 'INACTIVE',
    };
  }
}

@Component({
  selector: 'app-admin-tenants',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  template: `
    <section>
      <header class="page-header-row">
        <div class="page-header mb-0">
          <h1>Tenant Applications</h1>
          <p>Review businesses that applied to join the platform.</p>
        </div>
        <select class="select select-bordered select-sm w-40" [ngModel]="statusFilter()" (ngModelChange)="onFilterChange($event)">
          <option value="ALL">All status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </header>

      <div class="panel">
        <div class="panel-body overflow-x-auto p-0">
          <table class="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of tenants(); track tenant.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/admin/tenants', tenant.id]" class="flex items-center gap-3 font-semibold hover:text-primary">
                      <span class="tenant-row-avatar">{{ tenant.name.charAt(0) }}</span>
                      <span>
                        {{ tenant.name }}
                        <span class="block text-xs font-normal text-base-content/45">{{ tenant.id }}</span>
                      </span>
                    </a>
                  </td>
                  <td>{{ tenant.email }}</td>
                  <td>{{ tenant.phone }}</td>
                  <td><span class="badge badge-outline badge-sm">{{ tenant.plan }}</span></td>
                  <td><span class="badge badge-sm" [ngClass]="statusBadge(tenant.status)">{{ tenant.status }}</span></td>
                  <td>{{ tenant.createdAt | date: 'MMM d, y h:mm a' }}</td>
                  <td class="space-x-1 whitespace-nowrap">
                    <a [routerLink]="['/admin/tenants', tenant.id]" class="btn btn-ghost btn-xs">View</a>
                    @if (tenant.status === 'PENDING') {
                      <button class="btn btn-success btn-xs" (click)="approve(tenant)">Approve</button>
                      <button class="btn btn-error btn-xs btn-outline" (click)="reject(tenant)">Reject</button>
                    } @else if (tenant.status === 'ACTIVE') {
                      <button class="btn btn-ghost btn-xs" (click)="deactivate(tenant)">Deactivate</button>
                    } @else {
                      <button class="btn btn-primary btn-xs btn-outline" (click)="approve(tenant)">Reactivate</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center text-base-content/45 py-12">No tenant applications found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class AdminTenantsComponent implements OnInit {
  private readonly adminService = inject(AdminTenantService);
  readonly statusFilter = signal<'ALL' | EntityStatus>('ALL');
  readonly tenants = signal<Tenant[]>([]);

  ngOnInit(): void {
    this.load();
  }

  onFilterChange(value: 'ALL' | EntityStatus): void {
    this.statusFilter.set(value);
    this.load();
  }

  load(): void {
    const filter = this.statusFilter();
    this.adminService.listTenants({ status: filter }).subscribe((t) => this.tenants.set(t));
  }

  statusBadge(status: EntityStatus): Record<string, boolean> {
    return {
      'badge-warning': status === 'PENDING',
      'badge-success': status === 'ACTIVE',
      'badge-ghost': status === 'INACTIVE',
    };
  }

  approve(tenant: Tenant): void {
    this.adminService.approve(tenant).subscribe(() => this.load());
  }

  reject(tenant: Tenant): void {
    this.adminService.reject(tenant).subscribe(() => this.load());
  }

  deactivate(tenant: Tenant): void {
    this.adminService.deactivate(tenant).subscribe(() => this.load());
  }
}
