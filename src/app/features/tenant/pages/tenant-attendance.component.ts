import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceRecord, Employee } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantPeopleService } from '../services/tenant-people.service';

@Component({
  selector: 'app-tenant-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <select class="select select-bordered" [(ngModel)]="selectedEmployeeId">
          <option value="">Select employee</option>
          @for (employee of employees(); track employee.id) {
            <option [value]="employee.id">{{ employee.name }}</option>
          }
        </select>
        <button class="btn btn-success" [disabled]="!selectedEmployeeId" (click)="clockIn()">Clock In</button>
        <button class="btn btn-warning" [disabled]="!selectedEmployeeId" (click)="clockOut()">Clock Out</button>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h1 class="card-title">Attendance History</h1>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Hours Worked</th></tr></thead>
              <tbody>
                @for (record of records(); track record.id) {
                  <tr>
                    <td>{{ record.employeeName }}</td>
                    <td>{{ record.clockIn | date:'MMM d, y h:mm a' }}</td>
                    <td>{{ record.clockOut ? (record.clockOut | date:'MMM d, y h:mm a') : '—' }}</td>
                    <td>{{ record.hoursWorked }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="text-center text-base-content/60">No attendance records.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantAttendanceComponent {
  private readonly peopleService = inject(TenantPeopleService);
  private readonly tenantContext = inject(TenantContextService);

  readonly employees = signal<Employee[]>([]);
  readonly records = signal<AttendanceRecord[]>([]);
  selectedEmployeeId = '';

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  clockIn(): void {
    if (!this.selectedEmployeeId) return;
    this.peopleService.clockIn(this.selectedEmployeeId).subscribe(() => this.reload());
  }

  clockOut(): void {
    if (!this.selectedEmployeeId) return;
    this.peopleService.clockOut(this.selectedEmployeeId).subscribe(() => this.reload());
  }

  private reload(): void {
    this.peopleService.listEmployees().subscribe((data) => this.employees.set(data));
    this.peopleService.listAttendance().subscribe((data) => this.records.set(data));
  }
}
