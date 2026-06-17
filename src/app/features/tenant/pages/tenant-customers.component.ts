import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer, Order } from '../../../core/models';
import { DataTableShellComponent } from '../../../shared/ui/data-table-shell.component';
import { TablePaginationComponent } from '../../../shared/ui/table-pagination.component';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantCustomerService } from '../services/tenant-customer.service';
import { TenantOrderService } from '../services/tenant-order.service';

@Component({
  selector: 'app-tenant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DataTableShellComponent, TablePaginationComponent],
  template: `
    <app-data-table-shell
      [title]="'Customers'"
      [description]="'View customer profiles, loyalty points, and spending behavior.'">
      <button table-action class="btn btn-primary" (click)="openAddModal()">Add Customer</button>

      <div table-filters class="grid gap-3 md:grid-cols-3">
        <label class="input input-bordered flex items-center gap-2 md:col-span-2">
          <span class="text-base-content/60">Search</span>
          <input
            type="text"
            class="grow"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event); page.set(1)"
            placeholder="Name, email, or phone"
          />
        </label>
        <select class="select select-bordered" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event); page.set(1)">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Points</th>
              <th>Lifetime Spending</th>
              <th>Purchase History</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (customer of pagedCustomers(); track customer.id) {
              <tr>
                <td class="font-medium">{{ customer.name }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.loyaltyPoints }}</td>
                <td>{{ lifetimeSpending(customer.id) | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ purchaseCount(customer.id) }} orders</td>
                <td>
                  <span class="badge" [class.badge-success]="customer.status === 'ACTIVE'" [class.badge-ghost]="customer.status !== 'ACTIVE'">
                    {{ customer.status }}
                  </span>
                </td>
                <td class="space-x-2">
                  <button class="btn btn-xs btn-outline" (click)="openEditModal(customer)">Edit</button>
                  <button class="btn btn-xs btn-error btn-outline" (click)="deleteCustomer(customer.id)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="text-center text-base-content/60">No customers found.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <app-table-pagination
        table-footer
        [page]="page()"
        [totalPages]="totalPages()"
        [total]="filteredCustomers().length"
        [start]="pageStart()"
        [end]="pageEnd()"
        (previous)="prevPage()"
        (next)="nextPage()"
      />
    </app-data-table-shell>

    @if (isModalOpen()) {
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-semibold text-lg">{{ editingId() ? 'Edit Customer' : 'Add Customer' }}</h3>
          <div class="grid gap-3 mt-4">
            <input class="input input-bordered w-full" [(ngModel)]="form.name" placeholder="Name" />
            <input class="input input-bordered w-full" [(ngModel)]="form.email" placeholder="Email" />
            <input class="input input-bordered w-full" [(ngModel)]="form.phone" placeholder="Phone" />
            <input class="input input-bordered w-full" type="number" min="0" [(ngModel)]="form.loyaltyPoints" placeholder="Loyalty points" />
            <select class="select select-bordered w-full" [(ngModel)]="form.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div class="modal-action">
            <button class="btn" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="save()">Save</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button (click)="closeModal()">close</button></form>
      </dialog>
    }
  `,
})
export class TenantCustomersComponent {
  private readonly pageSize = 8;
  private readonly customerService = inject(TenantCustomerService);
  private readonly orderService = inject(TenantOrderService);
  private readonly tenantContext = inject(TenantContextService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly page = signal(1);
  readonly customers = signal<Customer[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly form: {
    name: string;
    email: string;
    phone: string;
    loyaltyPoints: number;
    status: 'ACTIVE' | 'INACTIVE';
  } = {
    name: '',
    email: '',
    phone: '',
    loyaltyPoints: 0,
    status: 'ACTIVE',
  };

  readonly filteredCustomers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.customers().filter((customer) => {
      const matchesTerm =
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter() === 'ALL' || customer.status === this.statusFilter();
      return matchesTerm && matchesStatus;
    });
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCustomers().length / this.pageSize)));
  readonly pageStart = computed(() => (this.page() - 1) * this.pageSize);
  readonly pageEnd = computed(() => Math.min(this.pageStart() + this.pageSize, this.filteredCustomers().length));
  readonly pagedCustomers = computed(() => this.filteredCustomers().slice(this.pageStart(), this.pageStart() + this.pageSize));

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  prevPage(): void {
    this.page.update((current) => Math.max(1, current - 1));
  }

  nextPage(): void {
    this.page.update((current) => Math.min(this.totalPages(), current + 1));
  }

  lifetimeSpending(customerId: string): number {
    return this.orders()
      .filter((order) => order.customerId === customerId)
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }

  purchaseCount(customerId: string): number {
    return this.orders().filter((order) => order.customerId === customerId).length;
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.form.name = '';
    this.form.email = '';
    this.form.phone = '';
    this.form.loyaltyPoints = 0;
    this.form.status = 'ACTIVE';
    this.isModalOpen.set(true);
  }

  openEditModal(customer: Customer): void {
    this.editingId.set(customer.id);
    this.form.name = customer.name;
    this.form.email = customer.email;
    this.form.phone = customer.phone;
    this.form.loyaltyPoints = customer.loyaltyPoints;
    this.form.status = customer.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.email.trim()) return;
    const payload = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      loyaltyPoints: Number(this.form.loyaltyPoints),
      status: this.form.status,
    };
    const editingId = this.editingId();
    const request = editingId
      ? this.customerService.updateCustomer(editingId, payload)
      : this.customerService.createCustomer(payload);
    request.subscribe(() => {
      this.closeModal();
      this.reload();
    });
  }

  deleteCustomer(id: string): void {
    this.customerService.deleteCustomer(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.customerService.listCustomers().subscribe((data) => this.customers.set(data));
    this.orderService.listOrders().subscribe((data) => this.orders.set(data));
  }
}
