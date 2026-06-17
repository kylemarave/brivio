import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Variant } from '../models';
import { CreateVariantDto, UpdateVariantDto } from '../models/dtos';

export abstract class VariantRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Variant[]>>;
  abstract create(tenantId: string, dto: CreateVariantDto): Observable<ApiResponse<Variant>>;
  abstract update(tenantId: string, id: string, dto: UpdateVariantDto): Observable<ApiResponse<Variant>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
