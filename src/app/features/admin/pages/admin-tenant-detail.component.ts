import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiError } from '../../../core/api/api-response.model';
import { AdminTenantOverview, EntityStatus, SubscriptionPlan } from '../../../core/models';
import { AdminTenantService } from '../services/admin-tenant.service';

@Component({
  selector: 'app-admin-tenant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, CurrencyPipe],
  template: `
    <section class="space-y-8">
      <a routerLink="/admin/tenants" class="page-back-link">← Back to tenant applications</a>

      @if (errorMessage()) {
        <div class="alert-banner alert-banner-error">{{ errorMessage() }}</div>
      }

      @if (overview(); as o) {
        <div class="profile-hero">
          <div class="profile-hero-accent"></div>
          <div class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex gap-5">
              <div class="profile-avatar" [style.background]="avatarGradient(o.storeProfile.primaryColor)">
                {{ o.tenant.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-2xl font-bold tracking-tight">{{ o.tenant.name }}</h1>
                  <span class="badge-status" [ngClass]="statusBadge(o.tenant.status)">{{ o.tenant.status }}</span>
                  <span class="badge badge-outline badge-sm font-semibold">{{ o.tenant.plan }}</span>
                </div>
                <p class="mt-2 text-sm text-base-content/55 max-w-xl">{{ o.storeProfile.description || 'No store description provided yet.' }}</p>
                <p class="mt-2 text-xs text-base-content/40">Tenant ID · {{ o.tenant.id }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              @if (o.tenant.status === 'PENDING') {
                <button class="btn btn-success btn-sm" (click)="approve()">Approve application</button>
                <button class="btn btn-error btn-sm btn-outline" (click)="reject()">Reject</button>
              } @else if (o.tenant.status === 'ACTIVE') {
                <button class="btn btn-ghost btn-sm border border-base-300" (click)="deactivate()">Deactivate tenant</button>
              } @else {
                <button class="btn btn-primary btn-sm" (click)="approve()">Reactivate tenant</button>
              }
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <p class="kpi-card-label">Monthly revenue</p>
            <p class="kpi-card-value text-primary">{{ o.workspace.monthlyRevenue | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="kpi-card-desc">Gross from orders</p>
          </div>
          <div class="kpi-card">
            <p class="kpi-card-label">Products</p>
            <p class="kpi-card-value">{{ o.workspace.productCount }}</p>
            <p class="kpi-card-desc">Catalog items</p>
          </div>
          <div class="kpi-card">
            <p class="kpi-card-label">Orders</p>
            <p class="kpi-card-value">{{ o.workspace.orderCount }}</p>
            <p class="kpi-card-desc">{{ o.workspace.pendingOrders }} pending · {{ o.workspace.todaysOrders }} today</p>
          </div>
          <div class="kpi-card">
            <p class="kpi-card-label">Customers</p>
            <p class="kpi-card-value">{{ o.workspace.customerCount }}</p>
            <p class="kpi-card-desc">{{ o.workspace.employeeCount }} employees · {{ o.workspace.supplierCount }} suppliers</p>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-3">
          <div class="panel xl:col-span-2">
            <div class="panel-header"><h2>Business & contact</h2></div>
            <div class="panel-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <p class="detail-item-label">Owner email</p>
                  <p class="detail-item-value">{{ o.tenant.email }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-item-label">Phone</p>
                  <p class="detail-item-value">{{ o.tenant.phone }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-item-label">Store email</p>
                  <p class="detail-item-value">{{ o.storeProfile.email || '—' }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-item-label">Applied on</p>
                  <p class="detail-item-value">{{ o.tenant.createdAt | date:'MMMM d, y · h:mm a' }}</p>
                </div>
                <div class="detail-item sm:col-span-2">
                  <p class="detail-item-label">Address</p>
                  <p class="detail-item-value-muted">{{ o.storeProfile.address || 'Not set' }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-item-label">Business hours</p>
                  <p class="detail-item-value-muted">{{ o.storeProfile.businessHours || 'Not set' }}</p>
                </div>
                <div class="detail-item">
                  <p class="detail-item-label">Timezone</p>
                  <p class="detail-item-value">{{ o.settings.timezone }}</p>
                </div>
                @if (o.storeProfile.socialLinks) {
                  <div class="detail-item sm:col-span-2">
                    <p class="detail-item-label">Social links</p>
                    <p class="detail-item-value-muted">{{ o.storeProfile.socialLinks }}</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="panel">
              <div class="panel-header"><h2>Subscription plan</h2></div>
              <div class="panel-body space-y-4">
                <select class="select select-bordered w-full" [(ngModel)]="selectedPlan">
                  <option value="STARTER">Starter — $29/mo</option>
                  <option value="GROWTH">Growth — $79/mo</option>
                  <option value="PREMIUM">Premium — $149/mo</option>
                  <option value="ENTERPRISE">Enterprise — Custom</option>
                </select>
                <button class="btn btn-primary btn-sm w-full" (click)="savePlan()">Update plan</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Store branding</h2></div>
              <div class="panel-body space-y-3">
                <div class="flex items-center gap-3">
                  <span class="h-8 w-8 rounded-lg border border-base-300" [style.background]="o.storeProfile.primaryColor"></span>
                  <span class="h-8 w-8 rounded-lg border border-base-300" [style.background]="o.storeProfile.secondaryColor"></span>
                  <span class="text-sm text-base-content/60">Theme · {{ o.storeProfile.theme }}</span>
                </div>
                <p class="text-xs text-base-content/45 leading-relaxed">{{ o.storeProfile.receiptFooter }}</p>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><h2>Health alerts</h2></div>
              <div class="panel-body space-y-2">
                @if (o.workspace.lowStockAlerts > 0) {
                  <div class="flex items-center justify-between rounded-lg bg-warning/10 px-3 py-2 text-sm">
                    <span>Low stock items</span>
                    <span class="badge badge-warning badge-sm">{{ o.workspace.lowStockAlerts }}</span>
                  </div>
                } @else {
                  <p class="text-sm text-base-content/50">Inventory levels look healthy.</p>
                }
                @if (o.workspace.pendingOrders > 0) {
                  <div class="flex items-center justify-between rounded-lg bg-info/10 px-3 py-2 text-sm">
                    <span>Pending orders</span>
                    <span class="badge badge-info badge-sm">{{ o.workspace.pendingOrders }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h2>Recent orders</h2>
            <span class="text-xs text-base-content/45">Latest activity in this workspace</span>
          </div>
          <div class="panel-body overflow-x-auto p-0">
            @if (o.recentOrders.length) {
              <table class="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of o.recentOrders; track order.id) {
                    <tr>
                      <td class="font-semibold">{{ order.orderNumber }}</td>
                      <td><span class="badge badge-ghost badge-sm">{{ order.status }}</span></td>
                      <td>{{ order.totalAmount | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td class="text-base-content/55">{{ order.createdAt | date:'MMM d, y' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="p-6 text-sm text-base-content/50">No orders yet — typical for pending applications.</p>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class AdminTenantDetailComponent implements OnInit {
  private readonly adminService = inject(AdminTenantService);
  private readonly route = inject(ActivatedRoute);

  readonly overview = signal<AdminTenantOverview | null>(null);
  readonly errorMessage = signal('');
  selectedPlan: SubscriptionPlan = 'STARTER';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.load(id);
  }

  load(id: string): void {
    this.adminService.getTenantOverview(id).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.selectedPlan = data.tenant.plan;
      },
      error: (err) => this.errorMessage.set(err instanceof ApiError ? err.message : 'Failed to load tenant.'),
    });
  }

  statusBadge(status: EntityStatus): Record<string, boolean> {
    return {
      'badge-warning': status === 'PENDING',
      'badge-success': status === 'ACTIVE',
      'badge-ghost': status === 'INACTIVE',
    };
  }

  avatarGradient(color: string): string {
    return `linear-gradient(135deg, ${color || '#6366f1'}, oklch(42% 0.12 265))`;
  }

  savePlan(): void {
    const o = this.overview();
    if (!o) return;
    this.adminService.updateTenant(o.tenant.id, { plan: this.selectedPlan }).subscribe({
      next: () => this.load(o.tenant.id),
      error: (err) => this.errorMessage.set(err instanceof ApiError ? err.message : 'Update failed.'),
    });
  }

  approve(): void {
    const o = this.overview();
    if (!o) return;
    this.adminService.approve(o.tenant).subscribe({ next: () => this.load(o.tenant.id) });
  }

  reject(): void {
    const o = this.overview();
    if (!o) return;
    this.adminService.reject(o.tenant).subscribe({ next: () => this.load(o.tenant.id) });
  }

  deactivate(): void {
    const o = this.overview();
    if (!o) return;
    this.adminService.deactivate(o.tenant).subscribe({ next: () => this.load(o.tenant.id) });
  }
}
