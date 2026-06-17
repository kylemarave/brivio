import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { LoyaltyProgram } from '../models';
import { UpdateLoyaltyProgramDto } from '../models/dtos';

export abstract class LoyaltyRepository {
  abstract get(tenantId: string): Observable<ApiResponse<LoyaltyProgram>>;
  abstract update(tenantId: string, dto: UpdateLoyaltyProgramDto): Observable<ApiResponse<LoyaltyProgram>>;
}
