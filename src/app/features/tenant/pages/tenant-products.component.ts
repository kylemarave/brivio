import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Product } from '../../../core/models';
import { TenantCatalogService } from '../services/tenant-catalog.service';
import { TenantContextService } from '../services/tenant-context.service';

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
  private readonly catalogService = inject(TenantCatalogService);
  private readonly tenantContext = inject(TenantContextService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly page = signal(1);
  readonly isProductModalOpen = signal(false);
  readonly editingProductId = signal<string | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);

  readonly productForm: { name: string; sku: string; categoryId: string; price: number; status: 'ACTIVE' | 'INACTIVE' } = {
    name: '',
    sku: '',
    categoryId: '',
    price: 0,
    status: 'ACTIVE',
  };

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

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

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
    const editingId = this.editingProductId();
    const payload = {
      name: this.productForm.name.trim(),
      sku: this.productForm.sku.trim(),
      categoryId: this.productForm.categoryId,
      price: Number(this.productForm.price),
      status: this.productForm.status,
    };
    const request = editingId
      ? this.catalogService.updateProduct(editingId, payload)
      : this.catalogService.createProduct(payload);
    request.subscribe(() => {
      this.isProductModalOpen.set(false);
      this.reload();
    });
  }

  deleteProduct(id: string): void {
    this.catalogService.deleteProduct(id).subscribe(() => {
      if (this.page() > this.totalPages()) {
        this.page.set(this.totalPages());
      }
      this.reload();
    });
  }

  private reload(): void {
    this.catalogService.listProducts().subscribe((data) => this.products.set(data));
    this.catalogService.listCategories().subscribe((data) => this.categories.set(data));
  }
}
