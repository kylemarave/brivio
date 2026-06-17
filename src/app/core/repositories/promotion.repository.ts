import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Promotion } from '../models';
import { CreatePromotionDto, UpdatePromotionDto } from '../models/dtos';

export abstract class PromotionRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Promotion[]>>;
  abstract create(tenantId: string, dto: CreatePromotionDto): Observable<ApiResponse<Promotion>>;
  abstract update(tenantId: string, id: string, dto: UpdatePromotionDto): Observable<ApiResponse<Promotion>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
