import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntityStatus, Tenant } from '../../core/models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <header class="page-header">
        <h1>Platform Overview</h1>
        <p>Summary of tenant applications and active workspaces.</p>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <p class="kpi-card-label">Pending Applications</p>
          <p class="kpi-card-value text-warning">{{ stats().pendingApplications }}</p>
          <p class="kpi-card-desc">Awaiting your review</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Active Tenants</p>
          <p class="kpi-card-value text-success">{{ stats().activeTenants }}</p>
          <p class="kpi-card-desc">Approved and operating</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Inactive</p>
          <p class="kpi-card-value text-error">{{ stats().inactiveTenants }}</p>
          <p class="kpi-card-desc">Suspended or rejected</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Total Records</p>
          <p class="kpi-card-value">{{ stats().totalTenants }}</p>
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
                  <td class="font-medium">{{ tenant.name }}</td>
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
  readonly stats = computed(() => this.mockDataService.getAdminDashboardStats());
  readonly recentTenants = computed(() => this.mockDataService.getTenants().slice(0, 5));

  constructor(private readonly mockDataService: MockDataService) {}

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
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <section>
      <header class="page-header-row">
        <div class="page-header mb-0">
          <h1>Tenant Applications</h1>
          <p>Review businesses that applied to join the platform.</p>
        </div>
        <select class="select select-bordered select-sm w-40" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
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
              @for (tenant of filteredTenants(); track tenant.id) {
                <tr>
                  <td class="font-medium">{{ tenant.name }}</td>
                  <td>{{ tenant.email }}</td>
                  <td>{{ tenant.phone }}</td>
                  <td><span class="badge badge-outline badge-sm">{{ tenant.plan }}</span></td>
                  <td><span class="badge badge-sm" [ngClass]="statusBadge(tenant.status)">{{ tenant.status }}</span></td>
                  <td>{{ tenant.createdAt | date: 'MMM d, y h:mm a' }}</td>
                  <td class="space-x-1">
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
                  <td colspan="7" class="text-center text-base-content/50 py-8">No tenant applications found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class AdminTenantsComponent {
  readonly statusFilter = signal<'ALL' | EntityStatus>('ALL');
  readonly tenants = computed(() => this.mockDataService.getTenants());
  readonly filteredTenants = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'ALL') {
      return this.tenants();
    }
    return this.tenants().filter((tenant) => tenant.status === filter);
  });

  constructor(private readonly mockDataService: MockDataService) {}

  statusBadge(status: EntityStatus): Record<string, boolean> {
    return {
      'badge-warning': status === 'PENDING',
      'badge-success': status === 'ACTIVE',
      'badge-ghost': status === 'INACTIVE',
    };
  }

  approve(tenant: Tenant): void {
    this.mockDataService.updateTenantStatus(tenant.id, 'ACTIVE');
  }

  reject(tenant: Tenant): void {
    this.mockDataService.updateTenantStatus(tenant.id, 'INACTIVE');
  }

  deactivate(tenant: Tenant): void {
    this.mockDataService.updateTenantStatus(tenant.id, 'INACTIVE');
  }
}
