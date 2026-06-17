import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Payment } from '../../../core/models';
import { PaymentRepository } from '../../../core/repositories/payment.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantFinanceService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listPayments(): Observable<Payment[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.paymentRepository.list(tenantId).pipe(map((r) => r.data));
  }
}
