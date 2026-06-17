import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Order, OrderStatus, ReportSummary } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantOrderService } from '../services/tenant-order.service';
import { TenantReportService } from '../services/tenant-report.service';

@Component({
  selector: 'app-tenant-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">Reports</h1>
        <p class="text-base-content/70">Sales, revenue, inventory, customer, and employee insights for this tenant.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Sales Reports</div><div class="stat-value">{{ summary().totalOrders }}</div><div class="stat-desc">Total Orders</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Revenue Reports</div><div class="stat-value text-primary">{{ summary().totalRevenue | currency:'USD':'symbol':'1.0-0' }}</div><div class="stat-desc">Gross Revenue</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Inventory Reports</div><div class="stat-value text-warning">{{ summary().lowStockCount }}</div><div class="stat-desc">Low Stock Items</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Customer Reports</div><div class="stat-value">{{ summary().customerCount }}</div><div class="stat-desc">Registered Customers</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Employee Reports</div><div class="stat-value">{{ summary().employeeCount }}</div><div class="stat-desc">Team Members</div></div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Top Selling Products</h2>
            <ul class="space-y-2">
              @for (item of summary().topProducts; track item.name) {
                <li class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                  <span>{{ item.name }}</span>
                  <span class="badge badge-info">{{ item.quantity }} sold</span>
                </li>
              } @empty {
                <li class="text-sm text-base-content/60">No sales data yet.</li>
              }
            </ul>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Order Status Distribution</h2>
            <ul class="space-y-2">
              @for (status of statusSummary(); track status.label) {
                <li class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                  <span>{{ status.label }}</span>
                  <span class="badge">{{ status.count }}</span>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantReportsComponent {
  private readonly reportService = inject(TenantReportService);
  private readonly orderService = inject(TenantOrderService);
  private readonly tenantContext = inject(TenantContextService);

  readonly summary = signal<ReportSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    customerCount: 0,
    employeeCount: 0,
    topProducts: [],
    recentSales: [],
  });
  readonly orders = signal<Order[]>([]);

  readonly statusSummary = computed(() => {
    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    return statuses.map((status) => ({
      label: status,
      count: this.orders().filter((order) => order.status === status).length,
    }));
  });

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  private reload(): void {
    this.reportService.getReportSummary().subscribe((data) => this.summary.set(data));
    this.orderService.listOrders().subscribe((data) => this.orders.set(data));
  }
}
