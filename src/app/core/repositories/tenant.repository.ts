import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';
import { TenantQueryParams } from '../api/query-params.model';
import { AdminDashboardStats, AdminTenantOverview, Tenant } from '../models';
import { UpdateTenantDto } from '../models/dtos';

export abstract class TenantRepository {
  abstract list(params?: TenantQueryParams): Observable<PaginatedResponse<Tenant>>;
  abstract getById(id: string): Observable<ApiResponse<Tenant>>;
  abstract getOverview(id: string): Observable<ApiResponse<AdminTenantOverview>>;
  abstract update(id: string, dto: UpdateTenantDto): Observable<ApiResponse<Tenant>>;
  abstract getDashboardStats(): Observable<ApiResponse<AdminDashboardStats>>;
}
