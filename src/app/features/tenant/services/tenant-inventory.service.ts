import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Inventory } from '../../../core/models';
import { UpdateInventoryDto } from '../../../core/models/dtos';
import { InventoryRepository } from '../../../core/repositories/inventory.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantInventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listInventory(): Observable<Inventory[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.inventoryRepository.list(tenantId).pipe(map((r) => r.data));
  }

  updateInventory(id: string, dto: UpdateInventoryDto): Observable<Inventory> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.inventoryRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
