import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Payment, PaymentMethod } from '../../../core/models';
import { DataTableShellComponent } from '../../../shared/ui/data-table-shell.component';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantFinanceService } from '../services/tenant-finance.service';
import { TenantOrderService } from '../services/tenant-order.service';

@Component({
  selector: 'app-tenant-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, DataTableShellComponent],
  template: `
    <app-data-table-shell
      [title]="'Payments'"
      [description]="'Track transaction history and payment channel performance.'">
      <div table-filters class="grid gap-3 md:grid-cols-3">
        <select class="select select-bordered" [ngModel]="methodFilter()" (ngModelChange)="methodFilter.set($event)">
          <option value="ALL">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="E_WALLET">GCash / Maya</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
        <select class="select select-bordered" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Order</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (payment of filteredPayments(); track payment.id) {
              <tr>
                <td class="font-medium">{{ payment.id.toUpperCase() }}</td>
                <td>{{ payment.orderId.toUpperCase() }}</td>
                <td>{{ paymentMethodLabel(payment.method) }}</td>
                <td>{{ payment.amount | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-success]="payment.status === 'PAID'"
                    [class.badge-warning]="payment.status === 'PENDING'"
                    [class.badge-error]="payment.status === 'FAILED'">
                    {{ payment.status }}
                  </span>
                </td>
                <td>{{ payment.createdAt | date:'MMM d, y h:mm a' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="text-center text-base-content/60">No transactions found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-table-shell>
  `,
})
export class TenantPaymentsComponent {
  private readonly financeService = inject(TenantFinanceService);
  private readonly orderService = inject(TenantOrderService);
  private readonly tenantContext = inject(TenantContextService);

  readonly methodFilter = signal<'ALL' | PaymentMethod>('ALL');
  readonly statusFilter = signal<'ALL' | Payment['status']>('ALL');
  readonly payments = signal<Payment[]>([]);

  readonly filteredPayments = computed(() =>
    this.payments().filter((payment) => {
      const matchesMethod = this.methodFilter() === 'ALL' || payment.method === this.methodFilter();
      const matchesStatus = this.statusFilter() === 'ALL' || payment.status === this.statusFilter();
      return matchesMethod && matchesStatus;
    }),
  );

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  paymentMethodLabel(method: PaymentMethod): string {
    return this.orderService.paymentMethodLabel(method);
  }

  private reload(): void {
    this.financeService.listPayments().subscribe((data) => this.payments.set(data));
  }
}
