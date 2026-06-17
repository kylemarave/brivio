import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Addon } from '../../../core/models';
import { TenantCatalogService } from '../services/tenant-catalog.service';
import { TenantContextService } from '../services/tenant-context.service';

@Component({
  selector: 'app-tenant-addons',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-2xl font-semibold">Add-ons</h1>
        <button class="btn btn-primary" (click)="openAddModal()">Add Add-on</button>
      </div>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (addon of addons(); track addon.id) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">{{ addon.name }}</h2>
              <div class="card-actions justify-between items-center">
                <span class="badge badge-outline">{{ addon.price | currency:'USD':'symbol':'1.2-2' }}</span>
                <span class="badge" [class.badge-success]="addon.status === 'ACTIVE'">{{ addon.status }}</span>
              </div>
              <div class="card-actions justify-end gap-2">
                <button class="btn btn-xs btn-outline" (click)="openEditModal(addon)">Edit</button>
                <button class="btn btn-xs btn-error btn-outline" (click)="deleteAddon(addon.id)">Delete</button>
              </div>
            </div>
          </div>
        } @empty {
          <p class="text-base-content/60">No add-ons found.</p>
        }
      </div>

      @if (isModalOpen()) {
        <dialog class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-semibold text-lg">{{ editingId() ? 'Edit Add-on' : 'Add Add-on' }}</h3>
            <div class="grid gap-3 mt-4">
              <input class="input input-bordered w-full" [(ngModel)]="form.name" placeholder="Name" />
              <input class="input input-bordered w-full" type="number" min="0" step="0.01" [(ngModel)]="form.price" placeholder="Price" />
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
export class TenantAddonsComponent {
  private readonly catalogService = inject(TenantCatalogService);
  private readonly tenantContext = inject(TenantContextService);

  readonly addons = signal<Addon[]>([]);
  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form: { name: string; price: number; status: 'ACTIVE' | 'INACTIVE' } = {
    name: '',
    price: 0,
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
    this.form.price = 0;
    this.form.status = 'ACTIVE';
    this.isModalOpen.set(true);
  }

  openEditModal(addon: Addon): void {
    this.editingId.set(addon.id);
    this.form.name = addon.name;
    this.form.price = addon.price;
    this.form.status = addon.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const payload = {
      name: this.form.name.trim(),
      price: Number(this.form.price),
      status: this.form.status,
    };
    const editingId = this.editingId();
    const request = editingId
      ? this.catalogService.updateAddon(editingId, payload)
      : this.catalogService.createAddon(payload);
    request.subscribe(() => {
      this.closeModal();
      this.reload();
    });
  }

  deleteAddon(id: string): void {
    this.catalogService.deleteAddon(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.catalogService.listAddons().subscribe((data) => this.addons.set(data));
  }
}
