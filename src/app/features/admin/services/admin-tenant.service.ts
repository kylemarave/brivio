import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../core/api/api-response.model';
import { TenantQueryParams } from '../../../core/api/query-params.model';
import { AdminDashboardStats, AdminTenantOverview, Tenant } from '../../../core/models';
import { UpdateTenantDto } from '../../../core/models/dtos';
import { TenantRepository } from '../../../core/repositories/tenant.repository';

@Injectable({ providedIn: 'root' })
export class AdminTenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  listTenants(params?: TenantQueryParams): Observable<Tenant[]> {
    return this.tenantRepository.list(params).pipe(map((res) => res.data));
  }

  getTenant(id: string): Observable<Tenant> {
    return this.tenantRepository.getById(id).pipe(map((res) => res.data));
  }

  getTenantOverview(id: string): Observable<AdminTenantOverview> {
    return this.tenantRepository.getOverview(id).pipe(map((res) => res.data));
  }

  updateTenant(id: string, dto: UpdateTenantDto): Observable<Tenant> {
    return this.tenantRepository.update(id, dto).pipe(map((res) => res.data));
  }

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.tenantRepository.getDashboardStats().pipe(map((res) => res.data));
  }

  approve(tenant: Tenant): Observable<Tenant> {
    return this.updateTenant(tenant.id, { status: 'ACTIVE' });
  }

  reject(tenant: Tenant): Observable<Tenant> {
    return this.updateTenant(tenant.id, { status: 'INACTIVE' });
  }

  deactivate(tenant: Tenant): Observable<Tenant> {
    return this.updateTenant(tenant.id, { status: 'INACTIVE' });
  }
}
