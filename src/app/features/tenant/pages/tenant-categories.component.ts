import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models';
import { TenantCatalogService } from '../services/tenant-catalog.service';
import { TenantContextService } from '../services/tenant-context.service';

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
  private readonly catalogService = inject(TenantCatalogService);
  private readonly tenantContext = inject(TenantContextService);

  readonly isCategoryModalOpen = signal(false);
  readonly editingCategoryId = signal<string | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly categoryForm: { name: string; status: 'ACTIVE' | 'INACTIVE' } = { name: '', status: 'ACTIVE' };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

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
    const editingId = this.editingCategoryId();
    const payload = { name, status: this.categoryForm.status };
    const request = editingId
      ? this.catalogService.updateCategory(editingId, payload)
      : this.catalogService.createCategory(payload);
    request.subscribe(() => {
      this.closeCategoryModal();
      this.reload();
    });
  }

  deleteCategory(id: string): void {
    this.catalogService.deleteCategory(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.catalogService.listCategories().subscribe((data) => this.categories.set(data));
  }
}
