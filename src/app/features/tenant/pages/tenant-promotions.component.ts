import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Promotion } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantMarketingService } from '../services/tenant-marketing.service';

@Component({
  selector: 'app-tenant-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-2xl font-semibold">Promotions</h1>
        <button class="btn btn-primary" (click)="openAddModal()">Add Promotion</button>
      </div>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (promo of promotions(); track promo.id) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">{{ promo.name }}</h2>
              <p class="text-base-content/70">{{ promo.discountPercentage }}% off</p>
              <p class="text-xs text-base-content/60">{{ promo.startsAt | date:'MMM d' }} – {{ promo.endsAt | date:'MMM d, y' }}</p>
              <span class="badge" [class.badge-success]="promo.status === 'ACTIVE'">{{ promo.status }}</span>
              <div class="card-actions justify-end gap-2">
                <button class="btn btn-sm btn-outline" (click)="openEditModal(promo)">Edit</button>
                <button class="btn btn-sm btn-error btn-outline" (click)="deletePromotion(promo.id)">Delete</button>
              </div>
            </div>
          </div>
        } @empty {
          <p class="text-base-content/60">No promotions found.</p>
        }
      </div>

      @if (isModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingId() ? 'Edit Promotion' : 'Add Promotion' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="form.name" placeholder="Name" />
              <input class="input input-bordered w-full" type="number" min="0" max="100" [(ngModel)]="form.discountPercentage" placeholder="Discount %" />
              <input class="input input-bordered w-full" type="date" [(ngModel)]="form.startsAt" />
              <input class="input input-bordered w-full" type="date" [(ngModel)]="form.endsAt" />
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
export class TenantPromotionsComponent {
  private readonly marketingService = inject(TenantMarketingService);
  private readonly tenantContext = inject(TenantContextService);

  readonly promotions = signal<Promotion[]>([]);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form: {
    name: string;
    discountPercentage: number;
    startsAt: string;
    endsAt: string;
    status: 'ACTIVE' | 'INACTIVE';
  } = {
    name: '',
    discountPercentage: 10,
    startsAt: '',
    endsAt: '',
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
    this.form.name = '';
    this.form.discountPercentage = 10;
    this.form.startsAt = new Date().toISOString().slice(0, 10);
    this.form.endsAt = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    this.form.status = 'ACTIVE';
    this.isModalOpen.set(true);
  }

  openEditModal(promo: Promotion): void {
    this.editingId.set(promo.id);
    this.form.name = promo.name;
    this.form.discountPercentage = promo.discountPercentage;
    this.form.startsAt = promo.startsAt.slice(0, 10);
    this.form.endsAt = promo.endsAt.slice(0, 10);
    this.form.status = promo.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const payload = {
      name: this.form.name.trim(),
      discountPercentage: Number(this.form.discountPercentage),
      startsAt: this.form.startsAt,
      endsAt: this.form.endsAt,
      status: this.form.status,
    };
    const editingId = this.editingId();
    const request = editingId
      ? this.marketingService.updatePromotion(editingId, payload)
      : this.marketingService.createPromotion(payload);
    request.subscribe(() => {
      this.closeModal();
      this.reload();
    });
  }

  deletePromotion(id: string): void {
    this.marketingService.deletePromotion(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.marketingService.listPromotions().subscribe((data) => this.promotions.set(data));
  }
}
