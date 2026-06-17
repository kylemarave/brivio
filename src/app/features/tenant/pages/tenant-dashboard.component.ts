import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Inventory, Order, TenantDashboardStats } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantInventoryService } from '../services/tenant-inventory.service';
import { TenantOrderService } from '../services/tenant-order.service';
import { TenantReportService } from '../services/tenant-report.service';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <header class="page-header">
        <h1>Store Dashboard</h1>
        <p>Daily sales, orders, inventory alerts, and customer activity for your workspace.</p>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <p class="kpi-card-label">Today's Sales</p>
          <p class="kpi-card-value text-primary">\${{ stats().todaysSales | number:'1.0-0' }}</p>
          <p class="kpi-card-desc">Gross revenue today</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Today's Orders</p>
          <p class="kpi-card-value">{{ stats().todaysOrders }}</p>
          <p class="kpi-card-desc">Completed + pending</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Monthly Revenue</p>
          <p class="kpi-card-value">\${{ stats().monthlyRevenue | number:'1.0-0' }}</p>
          <p class="kpi-card-desc">Month to date</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Active Customers</p>
          <p class="kpi-card-value">{{ stats().activeCustomers }}</p>
          <p class="kpi-card-desc">With recent activity</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Low Stock Alerts</p>
          <p class="kpi-card-value text-warning">{{ stats().lowStockAlerts }}</p>
          <p class="kpi-card-desc">Items below reorder level</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card-label">Pending Orders</p>
          <p class="kpi-card-value text-info">{{ stats().pendingOrders }}</p>
          <p class="kpi-card-desc">Awaiting fulfillment</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-3">
        <div class="panel">
          <div class="panel-header"><h2>Sales This Week</h2></div>
          <div class="panel-body">
            <div class="flex h-36 items-end gap-2">
              @for (item of recentSales(); track item.label) {
                <div class="flex flex-1 flex-col items-center gap-1">
                  <div
                    class="w-full rounded-t bg-primary transition-all"
                    [style.height.%]="barHeight(item.amount)"
                  ></div>
                  <span class="text-xs text-base-content/60">{{ item.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h2>Sales This Month</h2></div>
          <div class="panel-body">
            <div class="flex h-36 items-end gap-2">
              @for (item of monthSales(); track item.label) {
                <div class="flex flex-1 flex-col items-center gap-1">
                  <div
                    class="w-full rounded-t bg-secondary transition-all"
                    [style.height.%]="barHeight(item.amount)"
                  ></div>
                  <span class="text-xs text-base-content/60">{{ item.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h2>Revenue Trend</h2></div>
          <div class="panel-body">
            <div class="flex h-36 items-end gap-2">
              @for (item of revenueTrend(); track item.label) {
                <div class="flex flex-1 flex-col items-center gap-1">
                  <div
                    class="w-full rounded-t bg-accent transition-all"
                    [style.height.%]="barHeight(item.amount)"
                  ></div>
                  <span class="text-xs text-base-content/60">{{ item.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-3">
        <div class="panel xl:col-span-2">
          <div class="panel-header">
            <h2>Recent Orders</h2>
            <a routerLink="/tenant/orders" class="btn btn-ghost btn-xs">View all</a>
          </div>
          <div class="panel-body overflow-x-auto p-0 pt-0">
            <table class="table">
              <thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead>
              <tbody>
                @for (order of recentOrders(); track order.id) {
                  <tr>
                    <td class="font-medium">{{ order.orderNumber }}</td>
                    <td><span class="badge badge-sm badge-ghost">{{ order.status }}</span></td>
                    <td>\${{ order.totalAmount | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h2>Inventory Alerts</h2></div>
          <div class="panel-body">
            <ul class="space-y-2">
              @for (item of lowStock(); track item.id) {
                <li class="flex items-center justify-between rounded-lg border border-base-300/60 px-3 py-2 text-sm">
                  <span>{{ item.productName }}</span>
                  <span class="badge badge-warning badge-sm">{{ item.quantity }} left</span>
                </li>
              } @empty {
                <li class="text-sm text-base-content/50">All stock levels healthy.</li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantDashboardComponent {
  private readonly reportService = inject(TenantReportService);
  private readonly orderService = inject(TenantOrderService);
  private readonly inventoryService = inject(TenantInventoryService);
  private readonly tenantContext = inject(TenantContextService);

  readonly stats = signal<TenantDashboardStats>({
    todaysSales: 0,
    todaysOrders: 0,
    monthlyRevenue: 0,
    activeCustomers: 0,
    lowStockAlerts: 0,
    pendingOrders: 0,
  });
  readonly recentSales = signal<{ label: string; amount: number }[]>([]);
  readonly recentOrders = signal<Order[]>([]);
  readonly inventory = signal<Inventory[]>([]);

  readonly lowStock = computed(() =>
    this.inventory()
      .filter((item) => item.quantity <= item.reorderLevel)
      .slice(0, 6),
  );

  readonly monthSales = computed(() => {
    const sales = this.recentSales();
    const chunk = Math.max(1, Math.ceil(sales.length / 4));
    return sales.filter((_, i) => i % chunk === 0).slice(0, 4);
  });

  readonly revenueTrend = computed(() => {
    let cumulative = 0;
    return this.recentSales().map((item) => {
      cumulative += item.amount;
      return { label: item.label, amount: cumulative };
    });
  });

  readonly maxSaleAmount = computed(() =>
    Math.max(...this.recentSales().map((s) => s.amount), 1),
  );

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  barHeight(amount: number): number {
    return Math.max(8, (amount / this.maxSaleAmount()) * 100);
  }

  private reload(): void {
    this.reportService.getDashboardStats().subscribe((data) => this.stats.set(data));
    this.reportService.getReportSummary().subscribe((summary) => this.recentSales.set(summary.recentSales));
    this.orderService.listOrders().subscribe((orders) => this.recentOrders.set(orders.slice(0, 8)));
    this.inventoryService.listInventory().subscribe((items) => this.inventory.set(items));
  }
}
