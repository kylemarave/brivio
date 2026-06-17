import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, Variant } from '../../../core/models';
import { TenantCatalogService } from '../services/tenant-catalog.service';
import { TenantContextService } from '../services/tenant-context.service';

@Component({
  selector: 'app-tenant-variants',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-2xl font-semibold">Variants</h1>
        <button class="btn btn-primary" (click)="openAddModal()">Add Variant</button>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body overflow-x-auto">
          <table class="table table-zebra">
            <thead><tr><th>Variant</th><th>Product</th><th>Additional Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              @for (variant of variants(); track variant.id) {
                <tr>
                  <td>{{ variant.name }}</td>
                  <td>{{ productName(variant.productId) }}</td>
                  <td>{{ variant.extraPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="variant.status === 'ACTIVE'" [class.badge-ghost]="variant.status !== 'ACTIVE'">
                      {{ variant.status }}
                    </span>
                  </td>
                  <td class="space-x-2">
                    <button class="btn btn-xs btn-outline" (click)="openEditModal(variant)">Edit</button>
                    <button class="btn btn-xs btn-error btn-outline" (click)="deleteVariant(variant.id)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-base-content/60">No variants found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (isModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingId() ? 'Edit Variant' : 'Add Variant' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="form.name" placeholder="Variant name" />
              <select class="select select-bordered w-full" [(ngModel)]="form.productId">
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
              <input class="input input-bordered w-full" type="number" min="0" step="0.01" [(ngModel)]="form.extraPrice" placeholder="Extra price" />
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
    </section>
  `,
})
export class TenantVariantsComponent {
  private readonly catalogService = inject(TenantCatalogService);
  private readonly tenantContext = inject(TenantContextService);

  readonly variants = signal<Variant[]>([]);
  readonly products = signal<Product[]>([]);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form: { productId: string; name: string; extraPrice: number; status: 'ACTIVE' | 'INACTIVE' } = {
    productId: '',
    name: '',
    extraPrice: 0,
    status: 'ACTIVE',
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  productName(productId: string): string {
    return this.products().find((p) => p.id === productId)?.name ?? 'Unknown';
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.form.productId = this.products()[0]?.id ?? '';
    this.form.name = '';
    this.form.extraPrice = 0;
    this.form.status = 'ACTIVE';
    this.isModalOpen.set(true);
  }

  openEditModal(variant: Variant): void {
    this.editingId.set(variant.id);
    this.form.productId = variant.productId;
    this.form.name = variant.name;
    this.form.extraPrice = variant.extraPrice;
    this.form.status = variant.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.productId) return;
    const payload = {
      productId: this.form.productId,
      name: this.form.name.trim(),
      extraPrice: Number(this.form.extraPrice),
      status: this.form.status,
    };
    const editingId = this.editingId();
    const request = editingId
      ? this.catalogService.updateVariant(editingId, payload)
      : this.catalogService.createVariant(payload);
    request.subscribe(() => {
      this.closeModal();
      this.reload();
    });
  }

  deleteVariant(id: string): void {
    this.catalogService.deleteVariant(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.catalogService.listVariants().subscribe((data) => this.variants.set(data));
    this.catalogService.listProducts().subscribe((data) => this.products.set(data));
  }
}
