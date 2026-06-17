import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supplier } from '../../../core/models';
import { DataTableShellComponent } from '../../../shared/ui/data-table-shell.component';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantPeopleService } from '../services/tenant-people.service';

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
  private readonly peopleService = inject(TenantPeopleService);
  private readonly tenantContext = inject(TenantContextService);

  readonly suppliers = signal<Supplier[]>([]);
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

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

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
    if (!this.supplierForm.name.trim() || !this.supplierForm.contactName.trim()) return;
    const payload = {
      ...this.supplierForm,
      name: this.supplierForm.name.trim(),
      contactName: this.supplierForm.contactName.trim(),
    };
    const editingId = this.editingSupplierId();
    const request = editingId
      ? this.peopleService.updateSupplier(editingId, payload)
      : this.peopleService.createSupplier(payload);
    request.subscribe(() => {
      this.closeSupplierModal();
      this.reload();
    });
  }

  deleteSupplier(id: string): void {
    this.peopleService.deleteSupplier(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.peopleService.listSuppliers().subscribe((data) => this.suppliers.set(data));
  }
}
