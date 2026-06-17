import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { AttendanceRecord } from '../models';

export abstract class AttendanceRepository {
  abstract list(tenantId: string): Observable<ApiResponse<AttendanceRecord[]>>;
  abstract clockIn(tenantId: string, employeeId: string): Observable<ApiResponse<AttendanceRecord>>;
  abstract clockOut(tenantId: string, employeeId: string): Observable<ApiResponse<AttendanceRecord>>;
}
