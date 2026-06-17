import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer, Order, OrderStatus, Payment, PaymentMethod, Product } from '../../../core/models';
import { TenantCatalogService } from '../services/tenant-catalog.service';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantCustomerService } from '../services/tenant-customer.service';
import { TenantOrderService } from '../services/tenant-order.service';

@Component({
  selector: 'app-tenant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Orders</h1>
          <p class="text-base-content/70">Track and update order flow from pending to completion.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">Create Order</button>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="grid gap-3 md:grid-cols-4">
            <label class="input input-bordered flex items-center gap-2 md:col-span-2">
              <span class="text-base-content/60">Search</span>
              <input
                type="text"
                class="grow"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                placeholder="Order # or Customer ID"
              />
            </label>
            <select class="select select-bordered" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="ALL">All Status</option>
              @for (status of statuses; track status) {
                <option [value]="status">{{ status }}</option>
              }
            </select>
            <select class="select select-bordered" [ngModel]="paymentFilter()" (ngModelChange)="paymentFilter.set($event)">
              <option value="ALL">All Payments</option>
              @for (method of paymentMethods; track method) {
                <option [value]="method">{{ paymentLabel(method) }}</option>
              }
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.id) {
                  <tr>
                    <td class="font-medium">
                      <button class="link link-primary" (click)="openDetailModal(order)">{{ order.orderNumber }}</button>
                    </td>
                    <td>{{ customerName(order.customerId) }}</td>
                    <td>{{ order.items.length }}</td>
                    <td>{{ order.totalAmount | currency:'USD':'symbol':'1.2-2' }}</td>
                    <td>
                      <span class="badge"
                        [class.badge-warning]="order.status === 'PENDING'"
                        [class.badge-info]="order.status === 'CONFIRMED' || order.status === 'PREPARING'"
                        [class.badge-success]="order.status === 'READY' || order.status === 'COMPLETED'"
                        [class.badge-error]="order.status === 'CANCELLED'">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>{{ paymentMethodLabel(order.id) }}</td>
                    <td>{{ order.createdAt | date:'MMM d, y h:mm a' }}</td>
                    <td>
                      <select class="select select-xs select-bordered" [ngModel]="order.status" (ngModelChange)="updateOrderStatus(order, $event)">
                        @for (status of statuses; track status) {
                          <option [value]="status">{{ status }}</option>
                        }
                      </select>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center text-base-content/60">No orders found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      @if (isDetailModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <h3 class="font-semibold text-lg">Order {{ selectedOrder()?.orderNumber }}</h3>
            @if (selectedOrder(); as order) {
              <div class="mt-4 space-y-3 text-sm">
                <p><span class="font-medium">Customer:</span> {{ customerName(order.customerId) }}</p>
                <p><span class="font-medium">Status:</span> {{ order.status }}</p>
                <p><span class="font-medium">Payment:</span> {{ detailPaymentLabel() }}</p>
                <p><span class="font-medium">Total:</span> {{ order.totalAmount | currency:'USD':'symbol':'1.2-2' }}</p>
                <table class="table table-sm">
                  <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                  <tbody>
                    @for (item of order.items; track item.productId) {
                      <tr>
                        <td>{{ item.productName }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.unitPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                        <td>{{ item.total | currency:'USD':'symbol':'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            <div class="modal-action">
              <button class="btn" (click)="closeDetailModal()">Close</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop"><button (click)="closeDetailModal()">close</button></form>
        </dialog>
      }

      @if (isCreateModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box max-w-lg">
            <h3 class="font-semibold text-lg">Create Order</h3>
            <div class="grid gap-3 mt-4">
              <select class="select select-bordered w-full" [(ngModel)]="createForm.customerId">
                <option value="">Select customer</option>
                @for (customer of customers(); track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
              <select class="select select-bordered w-full" [(ngModel)]="createForm.paymentMethod">
                @for (method of paymentMethods; track method) {
                  <option [value]="method">{{ paymentLabel(method) }}</option>
                }
              </select>
              <div class="space-y-2">
                <p class="text-sm font-medium">Items</p>
                @for (item of createForm.items; track $index) {
                  <div class="flex gap-2">
                    <select class="select select-bordered select-sm flex-1" [(ngModel)]="item.productId">
                      @for (product of products(); track product.id) {
                        <option [value]="product.id">{{ product.name }}</option>
                      }
                    </select>
                    <input class="input input-bordered input-sm w-20" type="number" min="1" [(ngModel)]="item.quantity" />
                    @if (createForm.items.length > 1) {
                      <button class="btn btn-xs btn-error btn-outline" (click)="removeItem($index)">×</button>
                    }
                  </div>
                }
                <button class="btn btn-xs btn-outline" (click)="addItem()">Add Item</button>
              </div>
            </div>
            <div class="modal-action">
              <button class="btn" (click)="closeCreateModal()">Cancel</button>
              <button class="btn btn-primary" (click)="createOrder()">Create</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop"><button (click)="closeCreateModal()">close</button></form>
        </dialog>
      }
    </section>
  `,
})
export class TenantOrdersComponent {
  readonly statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  readonly paymentMethods: PaymentMethod[] = ['CASH', 'CARD', 'E_WALLET', 'BANK_TRANSFER'];

  private readonly orderService = inject(TenantOrderService);
  private readonly customerService = inject(TenantCustomerService);
  private readonly catalogService = inject(TenantCatalogService);
  private readonly tenantContext = inject(TenantContextService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | OrderStatus>('ALL');
  readonly paymentFilter = signal<'ALL' | PaymentMethod>('ALL');
  readonly orders = signal<Order[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isDetailModalOpen = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly selectedOrder = signal<Order | null>(null);
  readonly selectedPayment = signal<Payment | null>(null);

  readonly createForm: {
    customerId: string;
    paymentMethod: PaymentMethod;
    items: { productId: string; quantity: number }[];
  } = {
    customerId: '',
    paymentMethod: 'CASH',
    items: [{ productId: '', quantity: 1 }],
  };

  readonly paymentMap = computed(() => {
    const map = new Map<string, Payment>();
    for (const payment of this.payments()) {
      map.set(payment.orderId, payment);
    }
    return map;
  });

  readonly customerMap = computed(() => {
    const map = new Map<string, Customer>();
    for (const customer of this.customers()) {
      map.set(customer.id, customer);
    }
    return map;
  });

  readonly filteredOrders = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.orders().filter((order) => {
      const payment = this.paymentMap().get(order.id);
      const matchesTerm =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerId.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter() === 'ALL' || order.status === this.statusFilter();
      const matchesPayment =
        this.paymentFilter() === 'ALL' || (payment?.method ?? null) === this.paymentFilter();
      return matchesTerm && matchesStatus && matchesPayment;
    });
  });

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  paymentLabel(method: PaymentMethod): string {
    return this.orderService.paymentMethodLabel(method);
  }

  paymentMethodLabel(orderId: string): string {
    const payment = this.paymentMap().get(orderId);
    return payment ? this.orderService.paymentMethodLabel(payment.method) : '—';
  }

  detailPaymentLabel(): string {
    const payment = this.selectedPayment();
    return payment ? this.orderService.paymentMethodLabel(payment.method) : '—';
  }

  customerName(customerId: string): string {
    return this.customerMap().get(customerId)?.name ?? customerId;
  }

  openDetailModal(order: Order): void {
    this.selectedOrder.set(order);
    this.selectedPayment.set(this.paymentMap().get(order.id) ?? null);
    this.orderService.getPaymentByOrderId(order.id).subscribe((payment) => {
      this.selectedPayment.set(payment);
    });
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedOrder.set(null);
    this.selectedPayment.set(null);
  }

  openCreateModal(): void {
    this.createForm.customerId = this.customers()[0]?.id ?? '';
    this.createForm.paymentMethod = 'CASH';
    this.createForm.items = [{ productId: this.products()[0]?.id ?? '', quantity: 1 }];
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  addItem(): void {
    this.createForm.items.push({ productId: this.products()[0]?.id ?? '', quantity: 1 });
  }

  removeItem(index: number): void {
    this.createForm.items.splice(index, 1);
  }

  createOrder(): void {
    if (!this.createForm.customerId || this.createForm.items.every((i) => !i.productId)) return;
    this.orderService
      .createOrder({
        customerId: this.createForm.customerId,
        paymentMethod: this.createForm.paymentMethod,
        items: this.createForm.items.filter((i) => i.productId),
      })
      .subscribe(() => {
        this.closeCreateModal();
        this.reload();
      });
  }

  updateOrderStatus(order: Order, value: string): void {
    if (!this.statuses.includes(value as OrderStatus)) return;
    this.orderService.updateOrderStatus(order.id, value as OrderStatus).subscribe(() => this.reload());
  }

  private reload(): void {
    this.orderService.listOrders().subscribe((data) => this.orders.set(data));
    this.orderService.listPayments().subscribe((data) => this.payments.set(data));
    this.customerService.listCustomers().subscribe((data) => this.customers.set(data));
    this.catalogService.listProducts().subscribe((data) => this.products.set(data));
  }
}
