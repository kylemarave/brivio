import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { StoreProfile } from '../models';
import { UpdateStoreProfileDto } from '../models/dtos';

export abstract class StoreProfileRepository {
  abstract get(tenantId: string): Observable<ApiResponse<StoreProfile>>;
  abstract update(tenantId: string, dto: UpdateStoreProfileDto): Observable<ApiResponse<StoreProfile>>;
}
