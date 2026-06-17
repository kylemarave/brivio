import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ReportSummary, TenantDashboardStats } from '../../../core/models';
import { ReportRepository } from '../../../core/repositories/report.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  getDashboardStats(): Observable<TenantDashboardStats> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.reportRepository.getTenantDashboardStats(tenantId).pipe(map((r) => r.data));
  }

  getReportSummary(): Observable<ReportSummary> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.reportRepository.getReportSummary(tenantId).pipe(map((r) => r.data));
  }
}
