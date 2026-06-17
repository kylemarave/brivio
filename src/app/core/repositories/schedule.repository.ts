import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { LeaveRequest, Shift } from '../models';
import { CreateShiftDto, UpdateLeaveRequestDto, UpdateShiftDto } from '../models/dtos';

export abstract class ScheduleRepository {
  abstract listShifts(tenantId: string): Observable<ApiResponse<Shift[]>>;
  abstract createShift(tenantId: string, dto: CreateShiftDto): Observable<ApiResponse<Shift>>;
  abstract updateShift(tenantId: string, id: string, dto: UpdateShiftDto): Observable<ApiResponse<Shift>>;
  abstract deleteShift(tenantId: string, id: string): Observable<ApiResponse<null>>;
  abstract listLeaveRequests(tenantId: string): Observable<ApiResponse<LeaveRequest[]>>;
  abstract updateLeaveRequest(
    tenantId: string,
    id: string,
    dto: UpdateLeaveRequestDto,
  ): Observable<ApiResponse<LeaveRequest>>;
}
