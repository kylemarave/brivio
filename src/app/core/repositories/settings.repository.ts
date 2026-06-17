import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { TenantSettings } from '../models';
import { UpdateTenantSettingsDto } from '../models/dtos';

export abstract class SettingsRepository {
  abstract get(tenantId: string): Observable<ApiResponse<TenantSettings>>;
  abstract update(tenantId: string, dto: UpdateTenantSettingsDto): Observable<ApiResponse<TenantSettings>>;
}
