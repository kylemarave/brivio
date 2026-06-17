import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { ReportSummary, TenantDashboardStats } from '../models';

export abstract class ReportRepository {
  abstract getTenantDashboardStats(tenantId: string): Observable<ApiResponse<TenantDashboardStats>>;
  abstract getReportSummary(tenantId: string): Observable<ApiResponse<ReportSummary>>;
}
