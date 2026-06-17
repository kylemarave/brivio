import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Inventory } from '../models';
import { UpdateInventoryDto } from '../models/dtos';

export abstract class InventoryRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Inventory[]>>;
  abstract update(tenantId: string, id: string, dto: UpdateInventoryDto): Observable<ApiResponse<Inventory>>;
}
