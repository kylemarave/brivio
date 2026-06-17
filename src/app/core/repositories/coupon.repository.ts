import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Coupon } from '../models';
import { CreateCouponDto, UpdateCouponDto } from '../models/dtos';

export abstract class CouponRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Coupon[]>>;
  abstract create(tenantId: string, dto: CreateCouponDto): Observable<ApiResponse<Coupon>>;
  abstract update(tenantId: string, id: string, dto: UpdateCouponDto): Observable<ApiResponse<Coupon>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
