import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  AttendanceRecord,
  Employee,
  LeaveRequest,
  Shift,
  Supplier,
} from '../../../core/models';
import {
  CreateEmployeeDto,
  CreateShiftDto,
  CreateSupplierDto,
  UpdateEmployeeDto,
  UpdateLeaveRequestDto,
  UpdateShiftDto,
  UpdateSupplierDto,
} from '../../../core/models/dtos';
import { AttendanceRepository } from '../../../core/repositories/attendance.repository';
import { EmployeeRepository } from '../../../core/repositories/employee.repository';
import { ScheduleRepository } from '../../../core/repositories/schedule.repository';
import { SupplierRepository } from '../../../core/repositories/supplier.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantPeopleService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listSuppliers(): Observable<Supplier[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.supplierRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createSupplier(dto: CreateSupplierDto): Observable<Supplier> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.supplierRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateSupplier(id: string, dto: UpdateSupplierDto): Observable<Supplier> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.supplierRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteSupplier(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.supplierRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listEmployees(): Observable<Employee[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.employeeRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createEmployee(dto: CreateEmployeeDto): Observable<Employee> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.employeeRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateEmployee(id: string, dto: UpdateEmployeeDto): Observable<Employee> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.employeeRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteEmployee(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.employeeRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  suspendEmployee(id: string): Observable<Employee> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.employeeRepository.suspend(tenantId, id).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listAttendance(): Observable<AttendanceRecord[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.attendanceRepository.list(tenantId).pipe(map((r) => r.data));
  }

  clockIn(employeeId: string): Observable<AttendanceRecord> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.attendanceRepository.clockIn(tenantId, employeeId).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  clockOut(employeeId: string): Observable<AttendanceRecord> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.attendanceRepository.clockOut(tenantId, employeeId).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listShifts(): Observable<Shift[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.listShifts(tenantId).pipe(map((r) => r.data));
  }

  createShift(dto: CreateShiftDto): Observable<Shift> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.createShift(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateShift(id: string, dto: UpdateShiftDto): Observable<Shift> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.updateShift(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteShift(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.deleteShift(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listLeaveRequests(): Observable<LeaveRequest[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.listLeaveRequests(tenantId).pipe(map((r) => r.data));
  }

  updateLeaveRequest(id: string, dto: UpdateLeaveRequestDto): Observable<LeaveRequest> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.scheduleRepository.updateLeaveRequest(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
