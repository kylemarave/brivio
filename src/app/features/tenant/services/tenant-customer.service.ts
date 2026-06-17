import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Customer } from '../../../core/models';
import { CreateCustomerDto, UpdateCustomerDto } from '../../../core/models/dtos';
import { CustomerRepository } from '../../../core/repositories/customer.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listCustomers(): Observable<Customer[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.customerRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createCustomer(dto: CreateCustomerDto): Observable<Customer> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.customerRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateCustomer(id: string, dto: UpdateCustomerDto): Observable<Customer> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.customerRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteCustomer(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.customerRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
