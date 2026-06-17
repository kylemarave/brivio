import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Coupon } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantMarketingService } from '../services/tenant-marketing.service';

@Component({
  selector: 'app-tenant-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-2xl font-semibold">Coupons</h1>
        <button class="btn btn-primary" (click)="openAddModal()">Add Coupon</button>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body overflow-x-auto">
          <table class="table table-zebra">
            <thead><tr><th>Coupon Code</th><th>Discount</th><th>Usage Limit</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              @for (coupon of coupons(); track coupon.id) {
                <tr>
                  <td class="font-medium">{{ coupon.code }}</td>
                  <td>{{ coupon.discountPercentage }}%</td>
                  <td>{{ coupon.usageLimit }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="coupon.status === 'ACTIVE'">{{ coupon.status }}</span>
                  </td>
                  <td class="space-x-2">
                    <button class="btn btn-xs btn-outline" (click)="openEditModal(coupon)">Edit</button>
                    <button class="btn btn-xs btn-error btn-outline" (click)="deleteCoupon(coupon.id)">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-base-content/60">No coupons found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (isModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingId() ? 'Edit Coupon' : 'Add Coupon' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="form.code" placeholder="Coupon code" />
              <input class="input input-bordered w-full" type="number" min="0" max="100" [(ngModel)]="form.discountPercentage" placeholder="Discount %" />
              <input class="input input-bordered w-full" type="number" min="1" [(ngModel)]="form.usageLimit" placeholder="Usage limit" />
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
export class TenantCouponsComponent {
  private readonly marketingService = inject(TenantMarketingService);
  private readonly tenantContext = inject(TenantContextService);

  readonly coupons = signal<Coupon[]>([]);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form: {
    code: string;
    discountPercentage: number;
    usageLimit: number;
    status: 'ACTIVE' | 'INACTIVE';
  } = {
    code: '',
    discountPercentage: 10,
    usageLimit: 100,
    status: 'ACTIVE',
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.form.code = '';
    this.form.discountPercentage = 10;
    this.form.usageLimit = 100;
    this.form.status = 'ACTIVE';
    this.isModalOpen.set(true);
  }

  openEditModal(coupon: Coupon): void {
    this.editingId.set(coupon.id);
    this.form.code = coupon.code;
    this.form.discountPercentage = coupon.discountPercentage;
    this.form.usageLimit = coupon.usageLimit;
    this.form.status = coupon.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (!this.form.code.trim()) return;
    const payload = {
      code: this.form.code.trim().toUpperCase(),
      discountPercentage: Number(this.form.discountPercentage),
      usageLimit: Number(this.form.usageLimit),
      status: this.form.status,
    };
    const editingId = this.editingId();
    const request = editingId
      ? this.marketingService.updateCoupon(editingId, payload)
      : this.marketingService.createCoupon(payload);
    request.subscribe(() => {
      this.closeModal();
      this.reload();
    });
  }

  deleteCoupon(id: string): void {
    this.marketingService.deleteCoupon(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.marketingService.listCoupons().subscribe((data) => this.coupons.set(data));
  }
}
