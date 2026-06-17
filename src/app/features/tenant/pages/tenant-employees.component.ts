import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../core/models';
import { DataTableShellComponent } from '../../../shared/ui/data-table-shell.component';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantPeopleService } from '../services/tenant-people.service';

@Component({
  selector: 'app-tenant-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableShellComponent],
  template: `
    <app-data-table-shell [title]="'Employees'" [description]="'Manage staff, roles, and account status.'">
      <button table-action class="btn btn-primary" (click)="openAddModal()">Add Employee</button>

      <div table-content class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of employees(); track employee.id) {
              <tr>
                <td class="font-medium">{{ employee.name }}</td>
                <td>{{ employee.email }}</td>
                <td>{{ employee.role }}</td>
                <td>
                  <span class="badge" [class.badge-success]="employee.status === 'ACTIVE'" [class.badge-ghost]="employee.status !== 'ACTIVE'">
                    {{ employee.status }}
                  </span>
                </td>
                <td class="space-x-2">
                  <button class="btn btn-xs btn-outline" (click)="openEditModal(employee)">Edit</button>
                  <button class="btn btn-xs btn-warning btn-outline" (click)="suspendEmployee(employee.id)">Suspend</button>
                  <button class="btn btn-xs btn-error btn-outline" (click)="deleteEmployee(employee.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-data-table-shell>

    @if (isEmployeeModalOpen()) {
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-semibold text-lg">{{ editingEmployeeId() ? 'Edit Employee' : 'Add Employee' }}</h3>
          <div class="grid gap-3 mt-4">
            <input class="input input-bordered" [(ngModel)]="employeeForm.name" placeholder="Employee Name" />
            <input class="input input-bordered" [(ngModel)]="employeeForm.email" placeholder="Email" />
            <select class="select select-bordered" [(ngModel)]="employeeForm.role">
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Barista">Barista</option>
              <option value="Staff">Staff</option>
            </select>
            <select class="select select-bordered" [(ngModel)]="employeeForm.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div class="modal-action">
            <button class="btn" (click)="closeEmployeeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveEmployee()">Save</button>
          </div>
        </div>
      </dialog>
    }
  `,
})
export class TenantEmployeesComponent {
  private readonly peopleService = inject(TenantPeopleService);
  private readonly tenantContext = inject(TenantContextService);

  readonly employees = signal<Employee[]>([]);
  readonly isEmployeeModalOpen = signal(false);
  readonly editingEmployeeId = signal<string | null>(null);
  readonly employeeForm: Omit<Employee, 'id' | 'tenantId'> = {
    name: '',
    email: '',
    role: 'Staff',
    status: 'ACTIVE',
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  openAddModal(): void {
    this.editingEmployeeId.set(null);
    this.employeeForm.name = '';
    this.employeeForm.email = '';
    this.employeeForm.role = 'Staff';
    this.employeeForm.status = 'ACTIVE';
    this.isEmployeeModalOpen.set(true);
  }

  openEditModal(employee: Employee): void {
    this.editingEmployeeId.set(employee.id);
    this.employeeForm.name = employee.name;
    this.employeeForm.email = employee.email;
    this.employeeForm.role = employee.role;
    this.employeeForm.status = employee.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.isEmployeeModalOpen.set(true);
  }

  closeEmployeeModal(): void {
    this.isEmployeeModalOpen.set(false);
  }

  saveEmployee(): void {
    if (!this.employeeForm.name.trim() || !this.employeeForm.email.trim()) return;
    const payload = {
      ...this.employeeForm,
      name: this.employeeForm.name.trim(),
      email: this.employeeForm.email.trim(),
    };
    const editingId = this.editingEmployeeId();
    const request = editingId
      ? this.peopleService.updateEmployee(editingId, payload)
      : this.peopleService.createEmployee(payload);
    request.subscribe(() => {
      this.closeEmployeeModal();
      this.reload();
    });
  }

  suspendEmployee(id: string): void {
    this.peopleService.suspendEmployee(id).subscribe(() => this.reload());
  }

  deleteEmployee(id: string): void {
    this.peopleService.deleteEmployee(id).subscribe(() => this.reload());
  }

  private reload(): void {
    this.peopleService.listEmployees().subscribe((data) => this.employees.set(data));
  }
}
