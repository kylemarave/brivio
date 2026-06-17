import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  Category,
  Customer,
  Employee,
  Inventory,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  Product,
  Supplier,
} from '../../core/models';
import { MockDataService } from '../../core/services/mock-data.service';
import { DataTableShellComponent } from '../../shared/ui/data-table-shell.component';
import { TablePaginationComponent } from '../../shared/ui/table-pagination.component';

const DEMO_TENANT_ID = 't-1';

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
        @for (title of ['Sales This Week', 'Sales This Month', 'Revenue Trend']; track title) {
          <div class="panel">
            <div class="panel-header"><h2>{{ title }}</h2></div>
            <div class="panel-body"><div class="chart-placeholder h-36">Chart visualization</div></div>
          </div>
        }
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
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? 't-1');
  readonly stats = computed(() => this.mockDataService.getTenantDashboardStats(this.tenantId()));
  readonly recentOrders = computed(() => this.mockDataService.getOrdersByTenant(this.tenantId()).slice(0, 8));
  readonly lowStock = computed(() =>
    this.mockDataService
      .getInventoryByTenant(this.tenantId())
      .filter((item) => item.quantity <= item.reorderLevel)
      .slice(0, 6),
  );

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}
}

@Component({
  selector: 'app-tenant-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">Store</h1>
        <p class="text-base-content/70">Manage store profile, business hours, and branding settings.</p>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-3">
            <h2 class="card-title">Store Profile</h2>
            <input class="input input-bordered" [(ngModel)]="profile.businessName" placeholder="Business Name" />
            <input class="input input-bordered" [(ngModel)]="profile.logo" placeholder="Logo URL" />
            <input class="input input-bordered" [(ngModel)]="profile.banner" placeholder="Banner URL" />
            <textarea class="textarea textarea-bordered" [(ngModel)]="profile.description" placeholder="Description"></textarea>
            <div class="grid gap-3 md:grid-cols-2">
              <input class="input input-bordered" [(ngModel)]="profile.phone" placeholder="Phone" />
              <input class="input input-bordered" [(ngModel)]="profile.email" placeholder="Email" />
            </div>
            <input class="input input-bordered" [(ngModel)]="profile.address" placeholder="Address" />
            <input class="input input-bordered" [(ngModel)]="profile.businessHours" placeholder="Business Hours" />
            <input class="input input-bordered" [(ngModel)]="profile.socialLinks" placeholder="Social Links" />
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-3">
            <h2 class="card-title">Branding</h2>
            <label class="label">Primary Color</label>
            <input type="color" class="input input-bordered w-full h-12 p-1" [(ngModel)]="branding.primaryColor" />
            <label class="label">Secondary Color</label>
            <input type="color" class="input input-bordered w-full h-12 p-1" [(ngModel)]="branding.secondaryColor" />
            <select class="select select-bordered" [(ngModel)]="branding.theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="cupcake">Cupcake</option>
              <option value="coffee">Coffee</option>
            </select>
            <textarea class="textarea textarea-bordered" [(ngModel)]="branding.receiptFooter" placeholder="Receipt Footer"></textarea>
            <button class="btn btn-primary">Save Store Settings</button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantStoreComponent {
  readonly profile = {
    businessName: 'Sugarblitz',
    logo: '',
    banner: '',
    description: 'Artisan coffee and pastries.',
    phone: '+63 912 345 6789',
    email: 'hello@sugarblitz.com',
    address: 'Cebu City',
    businessHours: 'Mon-Sun 7:00 AM - 10:00 PM',
    socialLinks: 'facebook.com/sugarblitz',
  };

  readonly branding = {
    primaryColor: '#8b5e3c',
    secondaryColor: '#f7d9aa',
    theme: 'coffee',
    receiptFooter: 'Thank you for choosing BRIVIO Cafe.',
  };
}

@Component({
  selector: 'app-tenant-products',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Products</h1>
          <p class="text-base-content/70">Manage coffee shop catalog with tenant-isolated product data.</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">Add Product</button>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="grid gap-3 md:grid-cols-3">
            <label class="input input-bordered flex items-center gap-2 md:col-span-2">
              <span class="text-base-content/60">Search</span>
              <input
                type="text"
                class="grow"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event); resetPage()"
                placeholder="Name or SKU"
              />
            </label>
            <select
              class="select select-bordered"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event); resetPage()"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of pagedProducts(); track product.id) {
                  <tr>
                    <td><div class="avatar placeholder"><div class="bg-base-300 text-base-content rounded w-10">☕</div></div></td>
                    <td class="font-medium">{{ product.name }}<div class="text-xs text-base-content/60">{{ product.sku }}</div></td>
                    <td>{{ categoryName(product.categoryId) }}</td>
                    <td>{{ product.price | currency:'USD':'symbol':'1.2-2' }}</td>
                    <td><span class="badge" [class.badge-success]="product.status === 'ACTIVE'" [class.badge-ghost]="product.status !== 'ACTIVE'">{{ product.status }}</span></td>
                    <td>{{ syntheticCreatedAt(product.id) | date:'MMM d, y' }}</td>
                    <td class="space-x-2">
                      <button class="btn btn-xs btn-outline" (click)="openEditModal(product)">Edit</button>
                      <button class="btn btn-xs btn-error btn-outline" (click)="deleteProduct(product.id)">Delete</button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="text-center text-base-content/60">No products found.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/70">
              Showing {{ filteredProducts().length === 0 ? 0 : pageStart() + 1 }}-{{ pageEnd() }} of {{ filteredProducts().length }}
            </p>
            <div class="join">
              <button class="join-item btn btn-sm" [disabled]="page() === 1" (click)="prevPage()">Prev</button>
              <button class="join-item btn btn-sm btn-disabled">Page {{ page() }}/{{ totalPages() }}</button>
              <button class="join-item btn btn-sm" [disabled]="page() >= totalPages()" (click)="nextPage()">Next</button>
            </div>
          </div>
        </div>
      </div>

      @if (isProductModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingProductId() ? 'Edit Product' : 'Add Product' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="productForm.name" placeholder="Product name" />
              <input class="input input-bordered w-full" [(ngModel)]="productForm.sku" placeholder="SKU" />
              <select class="select select-bordered w-full" [(ngModel)]="productForm.categoryId">
                @for (category of categories(); track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
              <input class="input input-bordered w-full" type="number" min="1" [(ngModel)]="productForm.price" placeholder="Price" />
              <select class="select select-bordered w-full" [(ngModel)]="productForm.status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="modal-action">
              <button class="btn" (click)="closeProductModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveProduct()">Save</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop"><button (click)="closeProductModal()">close</button></form>
        </dialog>
      }
    </section>
  `,
})
export class TenantProductsComponent {
  private readonly pageSize = 8;
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly page = signal(1);
  readonly isProductModalOpen = signal(false);
  readonly editingProductId = signal<string | null>(null);

  readonly productForm: { name: string; sku: string; categoryId: string; price: number; status: 'ACTIVE' | 'INACTIVE' } = {
    name: '',
    sku: '',
    categoryId: '',
    price: 0,
    status: 'ACTIVE',
  };

  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly categories = computed(() => this.mockDataService.getCategoriesByTenant(this.tenantId()));
  readonly products = computed(() => this.mockDataService.getProductsByTenant(this.tenantId()));
  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.products().filter((product) => {
      const matchesTerm = !term || product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter() === 'ALL' || product.status === this.statusFilter();
      return matchesTerm && matchesStatus;
    });
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));
  readonly pageStart = computed(() => (this.page() - 1) * this.pageSize);
  readonly pageEnd = computed(() => Math.min(this.pageStart() + this.pageSize, this.filteredProducts().length));
  readonly pagedProducts = computed(() =>
    this.filteredProducts().slice(this.pageStart(), this.pageStart() + this.pageSize),
  );

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  categoryName(categoryId: string): string {
    return this.categories().find((item) => item.id === categoryId)?.name ?? 'Uncategorized';
  }

  syntheticCreatedAt(entityId: string): string {
    const numeric = Number(entityId.replace(/\D/g, '').slice(-4)) || 1;
    return new Date(2026, 0, (numeric % 28) + 1).toISOString();
  }

  resetPage(): void {
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((current) => Math.max(1, current - 1));
  }

  nextPage(): void {
    this.page.update((current) => Math.min(this.totalPages(), current + 1));
  }

  openAddModal(): void {
    this.editingProductId.set(null);
    const defaultCategory = this.categories()[0]?.id ?? '';
    this.productForm.name = '';
    this.productForm.sku = '';
    this.productForm.categoryId = defaultCategory;
    this.productForm.price = 0;
    this.productForm.status = 'ACTIVE';
    this.isProductModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.productForm.name = product.name;
    this.productForm.sku = product.sku;
    this.productForm.categoryId = product.categoryId;
    this.productForm.price = product.price;
    this.productForm.status = product.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
  }

  saveProduct(): void {
    if (!this.productForm.name.trim() || !this.productForm.sku.trim() || !this.productForm.categoryId) {
      return;
    }
    const tenantId = this.tenantId();
    const editingId = this.editingProductId();
    if (editingId) {
      this.mockDataService.updateProduct(editingId, tenantId, {
        name: this.productForm.name.trim(),
        sku: this.productForm.sku.trim(),
        categoryId: this.productForm.categoryId,
        price: Number(this.productForm.price),
        status: this.productForm.status,
      });
    } else {
      this.mockDataService.createProduct({
        tenantId,
        name: this.productForm.name.trim(),
        sku: this.productForm.sku.trim(),
        categoryId: this.productForm.categoryId,
        price: Number(this.productForm.price),
        status: this.productForm.status,
      });
    }
    this.isProductModalOpen.set(false);
  }

  deleteProduct(id: string): void {
    this.mockDataService.deleteProduct(id, this.tenantId());
    if (this.page() > this.totalPages()) {
      this.page.set(this.totalPages());
    }
  }
}

@Component({
  selector: 'app-tenant-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Categories</h1>
          <p class="text-base-content/70">Create, edit, and retire category groups for the store catalog.</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">Add Category</button>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                @for (category of categories(); track category.id) {
                  <tr>
                    <td>{{ category.name }}</td>
                    <td><span class="badge" [class.badge-success]="category.status === 'ACTIVE'" [class.badge-ghost]="category.status !== 'ACTIVE'">{{ category.status }}</span></td>
                    <td class="space-x-2">
                      <button class="btn btn-xs btn-outline" (click)="openEditModal(category)">Edit</button>
                      <button class="btn btn-xs btn-error btn-outline" (click)="deleteCategory(category.id)">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      @if (isCategoryModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingCategoryId() ? 'Edit Category' : 'Add Category' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="categoryForm.name" placeholder="Category name" />
              <select class="select select-bordered w-full" [(ngModel)]="categoryForm.status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="modal-action">
              <button class="btn" (click)="closeCategoryModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveCategory()">Save</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop"><button (click)="closeCategoryModal()">close</button></form>
        </dialog>
      }
    </section>
  `,
})
export class TenantCategoriesComponent {
  readonly isCategoryModalOpen = signal(false);
  readonly editingCategoryId = signal<string | null>(null);
  readonly categoryForm: { name: string; status: 'ACTIVE' | 'INACTIVE' } = { name: '', status: 'ACTIVE' };
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly categories = computed(() => this.mockDataService.getCategoriesByTenant(this.tenantId()));

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  openAddModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.name = '';
    this.categoryForm.status = 'ACTIVE';
    this.isCategoryModalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.name = category.name;
    this.categoryForm.status = category.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isCategoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen.set(false);
  }

  saveCategory(): void {
    const name = this.categoryForm.name.trim();
    if (!name) {
      return;
    }
    const tenantId = this.tenantId();
    const editingId = this.editingCategoryId();
    if (editingId) {
      this.mockDataService.updateCategory(editingId, tenantId, { name, status: this.categoryForm.status });
    } else {
      this.mockDataService.createCategory({ tenantId, name, status: this.categoryForm.status });
    }
    this.closeCategoryModal();
  }

  deleteCategory(id: string): void {
    this.mockDataService.deleteCategory(id, this.tenantId());
  }
}
@Component({
  selector: 'app-tenant-variants',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Variants</h1>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body overflow-x-auto">
          <table class="table table-zebra">
            <thead><tr><th>Variant</th><th>Additional Price</th><th>Status</th></tr></thead>
            <tbody>
              @for (variant of variants; track variant.name) {
                <tr>
                  <td>{{ variant.name }}</td>
                  <td>{{ variant.extraPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td><span class="badge badge-success">ACTIVE</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class TenantVariantsComponent {
  readonly variants = [
    { name: 'Small', extraPrice: 0 },
    { name: 'Medium', extraPrice: 0.5 },
    { name: 'Large', extraPrice: 1 },
    { name: 'Extra Large', extraPrice: 1.5 },
  ];
}
@Component({
  selector: 'app-tenant-addons',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Add-ons</h1>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (addon of addons; track addon.name) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">{{ addon.name }}</h2>
              <p class="text-base-content/70">{{ addon.description }}</p>
              <div class="card-actions justify-between items-center">
                <span class="badge badge-outline">{{ addon.price | currency:'USD':'symbol':'1.2-2' }}</span>
                <button class="btn btn-xs btn-outline">Edit</button>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class TenantAddonsComponent {
  readonly addons = [
    { name: 'Extra Shot', price: 0.8, description: 'Add one espresso shot.' },
    { name: 'Soy Milk', price: 0.6, description: 'Replace dairy milk with soy.' },
    { name: 'Oat Milk', price: 0.8, description: 'Replace dairy milk with oat.' },
    { name: 'Whipped Cream', price: 0.5, description: 'Cream topping.' },
    { name: 'Caramel Syrup', price: 0.7, description: 'Sweet caramel flavor.' },
  ];
}
@Component({
  selector: 'app-tenant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold">Orders</h1>
        <p class="text-base-content/70">Track and update order flow from pending to completion.</p>
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
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
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
                    <td class="font-medium">{{ order.orderNumber }}</td>
                    <td>{{ order.customerId }}</td>
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
                    <td>{{ paymentMethod(order.id) }}</td>
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
    </section>
  `,
})
export class TenantOrdersComponent {
  readonly statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | OrderStatus>('ALL');
  readonly paymentFilter = signal<'ALL' | 'Cash' | 'GCash' | 'Maya' | 'Card' | 'Bank Transfer'>('ALL');
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly orders = computed(() => this.mockDataService.getOrdersByTenant(this.tenantId()));
  readonly filteredOrders = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.orders().filter((order) => {
      const payment = this.paymentMethod(order.id);
      const matchesTerm =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerId.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter() === 'ALL' || order.status === this.statusFilter();
      const matchesPayment = this.paymentFilter() === 'ALL' || payment === this.paymentFilter();
      return matchesTerm && matchesStatus && matchesPayment;
    });
  });

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  updateOrderStatus(order: Order, value: string): void {
    if (!this.statuses.includes(value as OrderStatus)) {
      return;
    }
    this.mockDataService.updateOrderStatus(order.id, this.tenantId(), value as OrderStatus);
  }

  paymentMethod(orderId: string): 'Cash' | 'GCash' | 'Maya' | 'Card' | 'Bank Transfer' {
    const methods: Array<'Cash' | 'GCash' | 'Maya' | 'Card' | 'Bank Transfer'> = [
      'Cash',
      'GCash',
      'Maya',
      'Card',
      'Bank Transfer',
    ];
    const numeric = Number(orderId.replace(/\D/g, ''));
    return methods[numeric % methods.length];
  }
}
@Component({
  selector: 'app-tenant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DataTableShellComponent, TablePaginationComponent],
  template: `
    <app-data-table-shell
      [title]="'Customers'"
      [description]="'View customer profiles, loyalty points, and spending behavior.'">
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
              </tr>
            } @empty {
              <tr><td colspan="7" class="text-center text-base-content/60">No customers found.</td></tr>
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
  `,
})
export class TenantCustomersComponent {
  private readonly pageSize = 8;
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly page = signal(1);
  readonly customers = computed(() => this.mockDataService.getCustomersByTenant(this.tenantId()));
  readonly orders = computed(() => this.mockDataService.getOrdersByTenant(this.tenantId()));
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

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

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
}
@Component({
  selector: 'app-tenant-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Loyalty Program</h1>
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="card bg-base-100 shadow-sm lg:col-span-2">
          <div class="card-body space-y-3">
            <h2 class="card-title">Point Rules</h2>
            <label class="label">Points per purchase</label>
            <input class="input input-bordered" type="number" [(ngModel)]="pointRules.pointsPerPurchase" />
            <label class="label">Minimum spend for points</label>
            <input class="input input-bordered" type="number" [(ngModel)]="pointRules.minimumSpend" />
            <label class="label">Points expiry (days)</label>
            <input class="input input-bordered" type="number" [(ngModel)]="pointRules.expiryDays" />
            <button class="btn btn-primary">Save Rules</button>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Rewards</h2>
            <ul class="space-y-2">
              @for (reward of rewards; track reward.name) {
                <li class="rounded-box bg-base-200 p-3 flex justify-between">
                  <span>{{ reward.name }}</span>
                  <span class="badge badge-info">{{ reward.points }} pts</span>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Redemption History</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead><tr><th>Customer</th><th>Reward</th><th>Points</th><th>Date</th></tr></thead>
              <tbody>
                @for (entry of redemptionHistory; track entry.id) {
                  <tr><td>{{ entry.customer }}</td><td>{{ entry.reward }}</td><td>{{ entry.points }}</td><td>{{ entry.date }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantLoyaltyComponent {
  readonly pointRules = { pointsPerPurchase: 1, minimumSpend: 100, expiryDays: 365 };
  readonly rewards = [
    { name: 'Free Americano', points: 120 },
    { name: 'Any Pastry', points: 180 },
    { name: 'Large Drink Upgrade', points: 80 },
  ];
  readonly redemptionHistory = [
    { id: 'r1', customer: 'Customer 3', reward: 'Free Americano', points: 120, date: '2026-06-15' },
    { id: 'r2', customer: 'Customer 7', reward: 'Any Pastry', points: 180, date: '2026-06-12' },
  ];
}
@Component({
  selector: 'app-tenant-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableShellComponent],
  template: `
    <app-data-table-shell
      [title]="'Inventory'"
      [description]="'Monitor stock levels, reorder points, and supplier assignments.'">
      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Item</th>
              <th>Stock</th>
              <th>Minimum Stock</th>
              <th>Unit</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Stock Logs</th>
            </tr>
          </thead>
          <tbody>
            @for (item of inventory(); track item.id) {
              <tr>
                <td class="font-medium">{{ item.productName }}</td>
                <td>
                  <input
                    type="number"
                    class="input input-bordered input-xs w-20"
                    [ngModel]="item.quantity"
                    (ngModelChange)="updateStock(item, $event)"
                  />
                </td>
                <td>{{ item.reorderLevel }}</td>
                <td>{{ item.unit }}</td>
                <td>{{ supplierName(item.supplierId) }}</td>
                <td>
                  <span class="badge"
                    [class.badge-success]="item.quantity > item.reorderLevel"
                    [class.badge-warning]="item.quantity <= item.reorderLevel">
                    {{ item.quantity > item.reorderLevel ? 'OK' : 'LOW' }}
                  </span>
                </td>
                <td class="text-xs text-base-content/70">{{ stockLog(item) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-table-shell>
  `,
})
export class TenantInventoryComponent {
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly inventory = computed(() => this.mockDataService.getInventoryByTenant(this.tenantId()));
  readonly suppliers = computed(() => this.mockDataService.getSuppliersByTenant(this.tenantId()));

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  updateStock(item: Inventory, value: number): void {
    this.mockDataService.updateInventoryQuantity(item.id, this.tenantId(), Number(value));
  }

  supplierName(supplierId: string): string {
    return this.suppliers().find((supplier) => supplier.id === supplierId)?.name ?? 'Unassigned';
  }

  stockLog(item: Inventory): string {
    const status = item.quantity <= item.reorderLevel ? 'Restock needed' : 'Healthy stock';
    return `${status} • updated today`;
  }
}
@Component({
  selector: 'app-tenant-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableShellComponent],
  template: `
    <app-data-table-shell [title]="'Suppliers'" [description]="'Manage supplier directory and procurement contacts.'">
      <button table-action class="btn btn-primary" (click)="openAddModal()">Add Supplier</button>

      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers(); track supplier.id) {
              <tr>
                <td class="font-medium">{{ supplier.name }}</td>
                <td>{{ supplier.contactName }}</td>
                <td>{{ supplier.phone }}</td>
                <td>{{ supplier.email }}</td>
                <td>{{ supplier.address }}</td>
                <td>
                  <span class="badge" [class.badge-success]="supplier.status === 'ACTIVE'" [class.badge-ghost]="supplier.status !== 'ACTIVE'">
                    {{ supplier.status }}
                  </span>
                </td>
                <td class="space-x-2">
                  <button class="btn btn-xs btn-outline" (click)="openEditModal(supplier)">Edit</button>
                  <button class="btn btn-xs btn-error btn-outline" (click)="deleteSupplier(supplier.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-table-shell>

    @if (isSupplierModalOpen()) {
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-semibold text-lg">{{ editingSupplierId() ? 'Edit Supplier' : 'Add Supplier' }}</h3>
          <div class="grid gap-3 mt-4">
            <input class="input input-bordered" [(ngModel)]="supplierForm.name" placeholder="Company Name" />
            <input class="input input-bordered" [(ngModel)]="supplierForm.contactName" placeholder="Contact Person" />
            <input class="input input-bordered" [(ngModel)]="supplierForm.phone" placeholder="Phone" />
            <input class="input input-bordered" [(ngModel)]="supplierForm.email" placeholder="Email" />
            <input class="input input-bordered" [(ngModel)]="supplierForm.address" placeholder="Address" />
            <select class="select select-bordered" [(ngModel)]="supplierForm.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div class="modal-action">
            <button class="btn" (click)="closeSupplierModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveSupplier()">Save</button>
          </div>
        </div>
      </dialog>
    }
  `,
})
export class TenantSuppliersComponent {
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly suppliers = computed(() => this.mockDataService.getSuppliersByTenant(this.tenantId()));
  readonly isSupplierModalOpen = signal(false);
  readonly editingSupplierId = signal<string | null>(null);
  readonly supplierForm: Omit<Supplier, 'id' | 'tenantId'> = {
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE',
  };

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  openAddModal(): void {
    this.editingSupplierId.set(null);
    this.supplierForm.name = '';
    this.supplierForm.contactName = '';
    this.supplierForm.phone = '';
    this.supplierForm.email = '';
    this.supplierForm.address = '';
    this.supplierForm.status = 'ACTIVE';
    this.isSupplierModalOpen.set(true);
  }

  openEditModal(supplier: Supplier): void {
    this.editingSupplierId.set(supplier.id);
    this.supplierForm.name = supplier.name;
    this.supplierForm.contactName = supplier.contactName;
    this.supplierForm.phone = supplier.phone;
    this.supplierForm.email = supplier.email;
    this.supplierForm.address = supplier.address;
    this.supplierForm.status = supplier.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isSupplierModalOpen.set(true);
  }

  closeSupplierModal(): void {
    this.isSupplierModalOpen.set(false);
  }

  saveSupplier(): void {
    if (!this.supplierForm.name.trim() || !this.supplierForm.contactName.trim()) {
      return;
    }
    const tenantId = this.tenantId();
    const editingId = this.editingSupplierId();
    if (editingId) {
      this.mockDataService.updateSupplier(editingId, tenantId, {
        ...this.supplierForm,
        name: this.supplierForm.name.trim(),
        contactName: this.supplierForm.contactName.trim(),
      });
    } else {
      this.mockDataService.createSupplier({
        tenantId,
        ...this.supplierForm,
        name: this.supplierForm.name.trim(),
        contactName: this.supplierForm.contactName.trim(),
      });
    }
    this.closeSupplierModal();
  }

  deleteSupplier(id: string): void {
    this.mockDataService.deleteSupplier(id, this.tenantId());
  }
}

@Component({
  selector: 'app-tenant-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableShellComponent],
  template: `
    <app-data-table-shell [title]="'Employees'" [description]="'Manage staff, roles, and account status.'">
      <button table-action class="btn btn-primary" (click)="openAddModal()">Add Employee</button>

      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of employees(); track employee.id) {
              <tr>
                <td class="font-medium">{{ employee.name }}</td>
                <td>{{ employee.email }}</td>
                <td>{{ employee.role }}</td>
                <td>
                  <span class="badge" [class.badge-success]="employee.status === 'ACTIVE'" [class.badge-ghost]="employee.status !== 'ACTIVE'">
                    {{ employee.status }}
                  </span>
                </td>
                <td class="space-x-2">
                  <button class="btn btn-xs btn-outline" (click)="openEditModal(employee)">Edit</button>
                  <button class="btn btn-xs btn-warning btn-outline" (click)="suspendEmployee(employee.id)">Suspend</button>
                  <button class="btn btn-xs btn-error btn-outline" (click)="deleteEmployee(employee.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-table-shell>

    @if (isEmployeeModalOpen()) {
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-semibold text-lg">{{ editingEmployeeId() ? 'Edit Employee' : 'Add Employee' }}</h3>
          <div class="grid gap-3 mt-4">
            <input class="input input-bordered" [(ngModel)]="employeeForm.name" placeholder="Employee Name" />
            <input class="input input-bordered" [(ngModel)]="employeeForm.email" placeholder="Email" />
            <select class="select select-bordered" [(ngModel)]="employeeForm.role">
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Barista">Barista</option>
              <option value="Staff">Staff</option>
            </select>
            <select class="select select-bordered" [(ngModel)]="employeeForm.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div class="modal-action">
            <button class="btn" (click)="closeEmployeeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveEmployee()">Save</button>
          </div>
        </div>
      </dialog>
    }
  `,
})
export class TenantEmployeesComponent {
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly employees = computed(() => this.mockDataService.getEmployeesByTenant(this.tenantId()));
  readonly isEmployeeModalOpen = signal(false);
  readonly editingEmployeeId = signal<string | null>(null);
  readonly employeeForm: Omit<Employee, 'id' | 'tenantId'> = {
    name: '',
    email: '',
    role: 'Staff',
    status: 'ACTIVE',
  };

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  openAddModal(): void {
    this.editingEmployeeId.set(null);
    this.employeeForm.name = '';
    this.employeeForm.email = '';
    this.employeeForm.role = 'Staff';
    this.employeeForm.status = 'ACTIVE';
    this.isEmployeeModalOpen.set(true);
  }

  openEditModal(employee: Employee): void {
    this.editingEmployeeId.set(employee.id);
    this.employeeForm.name = employee.name;
    this.employeeForm.email = employee.email;
    this.employeeForm.role = employee.role;
    this.employeeForm.status = employee.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isEmployeeModalOpen.set(true);
  }

  closeEmployeeModal(): void {
    this.isEmployeeModalOpen.set(false);
  }

  saveEmployee(): void {
    if (!this.employeeForm.name.trim() || !this.employeeForm.email.trim()) {
      return;
    }
    const tenantId = this.tenantId();
    const editingId = this.editingEmployeeId();
    if (editingId) {
      this.mockDataService.updateEmployee(editingId, tenantId, {
        ...this.employeeForm,
        name: this.employeeForm.name.trim(),
        email: this.employeeForm.email.trim(),
      });
    } else {
      this.mockDataService.createEmployee({
        tenantId,
        ...this.employeeForm,
        name: this.employeeForm.name.trim(),
        email: this.employeeForm.email.trim(),
      });
    }
    this.closeEmployeeModal();
  }

  suspendEmployee(id: string): void {
    this.mockDataService.suspendEmployee(id, this.tenantId());
  }

  deleteEmployee(id: string): void {
    this.mockDataService.deleteEmployee(id, this.tenantId());
  }
}
@Component({
  selector: 'app-tenant-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <div class="flex gap-2">
        <button class="btn btn-success">Clock In</button>
        <button class="btn btn-warning">Clock Out</button>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h1 class="card-title">Attendance History</h1>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Hours Worked</th></tr></thead>
              <tbody>
                @for (record of records; track record.id) {
                  <tr>
                    <td>{{ record.employee }}</td>
                    <td>{{ record.clockIn }}</td>
                    <td>{{ record.clockOut }}</td>
                    <td>{{ record.hours }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantAttendanceComponent {
  readonly records = [
    { id: 'a1', employee: 'Employee 1', clockIn: '08:00 AM', clockOut: '05:00 PM', hours: 9 },
    { id: 'a2', employee: 'Employee 2', clockIn: '09:00 AM', clockOut: '06:00 PM', hours: 9 },
  ];
}
@Component({
  selector: 'app-tenant-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Schedule</h1>
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="card bg-base-100 shadow-sm"><div class="card-body"><h2 class="card-title">Morning Shift</h2><p>6:00 AM - 2:00 PM</p></div></div>
        <div class="card bg-base-100 shadow-sm"><div class="card-body"><h2 class="card-title">Afternoon Shift</h2><p>2:00 PM - 10:00 PM</p></div></div>
        <div class="card bg-base-100 shadow-sm"><div class="card-body"><h2 class="card-title">Night Shift</h2><p>10:00 PM - 6:00 AM</p></div></div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Leave Requests</h2>
          <ul class="space-y-2">
            @for (item of leaveRequests; track item.id) {
              <li class="rounded-box bg-base-200 p-3 flex items-center justify-between">
                <span>{{ item.employee }} - {{ item.date }}</span>
                <span class="badge" [class.badge-warning]="item.status === 'Pending'" [class.badge-success]="item.status === 'Approved'">{{ item.status }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class TenantScheduleComponent {
  readonly leaveRequests = [
    { id: 'l1', employee: 'Employee 4', date: '2026-06-20', status: 'Pending' },
    { id: 'l2', employee: 'Employee 2', date: '2026-06-22', status: 'Approved' },
  ];
}
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
                <td>{{ paymentMethodLabel(payment.method, payment.id) }}</td>
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
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly methodFilter = signal<'ALL' | PaymentMethod>('ALL');
  readonly statusFilter = signal<'ALL' | Payment['status']>('ALL');
  readonly payments = computed(() => this.mockDataService.getPaymentsByTenant(this.tenantId()));
  readonly filteredPayments = computed(() =>
    this.payments().filter((payment) => {
      const matchesMethod = this.methodFilter() === 'ALL' || payment.method === this.methodFilter();
      const matchesStatus = this.statusFilter() === 'ALL' || payment.status === this.statusFilter();
      return matchesMethod && matchesStatus;
    }),
  );

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}

  paymentMethodLabel(method: PaymentMethod, paymentId: string): string {
    if (method === 'E_WALLET') {
      const numeric = Number(paymentId.replace(/\D/g, ''));
      return numeric % 2 === 0 ? 'GCash' : 'Maya';
    }
    if (method === 'BANK_TRANSFER') {
      return 'Bank Transfer';
    }
    if (method === 'CARD') {
      return 'Card';
    }
    return 'Cash';
  }
}
@Component({
  selector: 'app-tenant-promotions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Promotions</h1>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (promo of promotions; track promo.name) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">{{ promo.name }}</h2>
              <p class="text-base-content/70">{{ promo.details }}</p>
              <button class="btn btn-sm btn-outline">Configure</button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class TenantPromotionsComponent {
  readonly promotions = [
    { name: 'Percentage Discount', details: 'Create %-off campaigns by category.' },
    { name: 'Fixed Discount', details: 'Set fixed amount discounts.' },
    { name: 'Buy 1 Get 1', details: 'Auto-apply B1G1 combos.' },
    { name: 'Happy Hour', details: 'Time-window based pricing.' },
  ];
}
@Component({
  selector: 'app-tenant-coupons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Coupons</h1>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body overflow-x-auto">
          <table class="table table-zebra">
            <thead><tr><th>Coupon Code</th><th>Discount</th><th>Expiration</th><th>Usage Count</th></tr></thead>
            <tbody>
              @for (coupon of coupons; track coupon.code) {
                <tr>
                  <td class="font-medium">{{ coupon.code }}</td>
                  <td>{{ coupon.discount }}</td>
                  <td>{{ coupon.expiration }}</td>
                  <td>{{ coupon.usageCount }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class TenantCouponsComponent {
  readonly coupons = [
    { code: 'WELCOME10', discount: '10%', expiration: '2026-08-01', usageCount: 31 },
    { code: 'COFFEE50', discount: '$0.50', expiration: '2026-07-15', usageCount: 12 },
  ];
}
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
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Sales Reports</div><div class="stat-value">{{ totalOrders() }}</div><div class="stat-desc">Total Orders</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Revenue Reports</div><div class="stat-value text-primary">{{ totalRevenue() | currency:'USD':'symbol':'1.0-0' }}</div><div class="stat-desc">Gross Revenue</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Inventory Reports</div><div class="stat-value text-warning">{{ lowStockCount() }}</div><div class="stat-desc">Low Stock Items</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Customer Reports</div><div class="stat-value">{{ customerCount() }}</div><div class="stat-desc">Registered Customers</div></div>
        <div class="stat bg-base-100 rounded-box shadow-sm"><div class="stat-title">Employee Reports</div><div class="stat-value">{{ employeeCount() }}</div><div class="stat-desc">Team Members</div></div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Top Selling Products</h2>
            <ul class="space-y-2">
              @for (item of topProducts(); track item.name) {
                <li class="flex items-center justify-between rounded-box bg-base-200 px-3 py-2">
                  <span>{{ item.name }}</span>
                  <span class="badge badge-info">{{ item.quantity }} sold</span>
                </li>
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
  readonly tenantId = computed(() => this.authService.currentUser()?.tenantId ?? DEMO_TENANT_ID);
  readonly orders = computed(() => this.mockDataService.getOrdersByTenant(this.tenantId()));
  readonly inventory = computed(() => this.mockDataService.getInventoryByTenant(this.tenantId()));
  readonly customers = computed(() => this.mockDataService.getCustomersByTenant(this.tenantId()));
  readonly employees = computed(() => this.mockDataService.getEmployeesByTenant(this.tenantId()));

  readonly totalOrders = computed(() => this.orders().length);
  readonly totalRevenue = computed(() => this.orders().reduce((sum, order) => sum + order.totalAmount, 0));
  readonly lowStockCount = computed(() => this.inventory().filter((item) => item.quantity <= item.reorderLevel).length);
  readonly customerCount = computed(() => this.customers().length);
  readonly employeeCount = computed(() => this.employees().length);
  readonly topProducts = computed(() => {
    const map = new Map<string, number>();
    for (const order of this.orders()) {
      for (const item of order.items) {
        map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity);
      }
    }
    return [...map.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  });
  readonly statusSummary = computed(() => {
    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    return statuses.map((status) => ({
      label: status,
      count: this.orders().filter((order) => order.status === status).length,
    }));
  });

  constructor(
    private readonly mockDataService: MockDataService,
    private readonly authService: AuthService,
  ) {}
}
@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">General</h2>
            <input class="input input-bordered" [(ngModel)]="settings.storeName" placeholder="Store Name" />
            <input class="input input-bordered" [(ngModel)]="settings.timezone" placeholder="Timezone" />
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Security</h2>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="toggle toggle-primary" [(ngModel)]="settings.twoFactor" />
              <span>Enable 2FA</span>
            </label>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="toggle toggle-primary" [(ngModel)]="settings.requirePinRefund" />
              <span>Require PIN for Refund</span>
            </label>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Notifications</h2>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="checkbox" [(ngModel)]="settings.emailAlerts" />
              <span>Email Alerts</span>
            </label>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="checkbox" [(ngModel)]="settings.lowStockAlerts" />
              <span>Low Stock Alerts</span>
            </label>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Integrations</h2>
            <input class="input input-bordered" [(ngModel)]="settings.paymentGateway" placeholder="Payment Gateway" />
            <input class="input input-bordered" [(ngModel)]="settings.emailProvider" placeholder="Email Provider" />
          </div>
        </div>
      </div>
      <button class="btn btn-primary">Save Settings</button>
    </section>
  `,
})
export class TenantSettingsComponent {
  readonly settings = {
    storeName: 'Sugarblitz',
    timezone: 'Asia/Manila',
    twoFactor: true,
    requirePinRefund: true,
    emailAlerts: true,
    lowStockAlerts: true,
    paymentGateway: 'Stripe',
    emailProvider: 'SendGrid',
  };
}
