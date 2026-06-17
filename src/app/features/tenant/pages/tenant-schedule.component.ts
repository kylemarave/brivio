import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { LeaveRequest, Shift } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantPeopleService } from '../services/tenant-people.service';

@Component({
  selector: 'app-tenant-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Schedule</h1>
      <div class="grid gap-4 lg:grid-cols-3">
        @for (shift of shifts(); track shift.id) {
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">{{ shift.name }}</h2>
              <p>{{ shift.startTime }} - {{ shift.endTime }}</p>
            </div>
          </div>
        } @empty {
          <p class="text-base-content/60">No shifts configured.</p>
        }
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Leave Requests</h2>
          <ul class="space-y-2">
            @for (item of leaveRequests(); track item.id) {
              <li class="rounded-box bg-base-200 p-3 flex items-center justify-between gap-3">
                <span>{{ item.employeeName }} - {{ item.date }}</span>
                <div class="flex items-center gap-2">
                  <span class="badge"
                    [class.badge-warning]="item.status === 'Pending'"
                    [class.badge-success]="item.status === 'Approved'"
                    [class.badge-error]="item.status === 'Rejected'">
                    {{ item.status }}
                  </span>
                  @if (item.status === 'Pending') {
                    <button class="btn btn-xs btn-success" (click)="approveLeave(item.id)">Approve</button>
                    <button class="btn btn-xs btn-error btn-outline" (click)="rejectLeave(item.id)">Reject</button>
                  }
                </div>
              </li>
            } @empty {
              <li class="text-sm text-base-content/60">No leave requests.</li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class TenantScheduleComponent {
  private readonly peopleService = inject(TenantPeopleService);
  private readonly tenantContext = inject(TenantContextService);

  readonly shifts = signal<Shift[]>([]);
  readonly leaveRequests = signal<LeaveRequest[]>([]);

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  approveLeave(id: string): void {
    this.peopleService.updateLeaveRequest(id, { status: 'Approved' }).subscribe(() => this.reload());
  }

  rejectLeave(id: string): void {
    this.peopleService.updateLeaveRequest(id, { status: 'Rejected' }).subscribe(() => this.reload());
  }

  private reload(): void {
    this.peopleService.listShifts().subscribe((data) => this.shifts.set(data));
    this.peopleService.listLeaveRequests().subscribe((data) => this.leaveRequests.set(data));
  }
}
