import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Addon } from '../models';
import { CreateAddonDto, UpdateAddonDto } from '../models/dtos';

export abstract class AddonRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Addon[]>>;
  abstract create(tenantId: string, dto: CreateAddonDto): Observable<ApiResponse<Addon>>;
  abstract update(tenantId: string, id: string, dto: UpdateAddonDto): Observable<ApiResponse<Addon>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
