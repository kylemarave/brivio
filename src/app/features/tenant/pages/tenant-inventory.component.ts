import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Inventory, Supplier } from '../../../core/models';
import { DataTableShellComponent } from '../../../shared/ui/data-table-shell.component';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantInventoryService } from '../services/tenant-inventory.service';
import { TenantPeopleService } from '../services/tenant-people.service';

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
  private readonly inventoryService = inject(TenantInventoryService);
  private readonly peopleService = inject(TenantPeopleService);
  private readonly tenantContext = inject(TenantContextService);

  readonly inventory = signal<Inventory[]>([]);
  readonly suppliers = signal<Supplier[]>([]);

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  updateStock(item: Inventory, value: number): void {
    this.inventoryService.updateInventory(item.id, { quantity: Number(value) }).subscribe(() => this.reload());
  }

  supplierName(supplierId: string): string {
    return this.suppliers().find((supplier) => supplier.id === supplierId)?.name ?? 'Unassigned';
  }

  stockLog(item: Inventory): string {
    const status = item.quantity <= item.reorderLevel ? 'Restock needed' : 'Healthy stock';
    return `${status} • updated today`;
  }

  private reload(): void {
    this.inventoryService.listInventory().subscribe((data) => this.inventory.set(data));
    this.peopleService.listSuppliers().subscribe((data) => this.suppliers.set(data));
  }
}
