import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Order, OrderStatus, Payment, PaymentMethod } from '../../../core/models';
import { CreateOrderDto } from '../../../core/models/dtos';
import { OrderRepository } from '../../../core/repositories/order.repository';
import { PaymentRepository } from '../../../core/repositories/payment.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listOrders(): Observable<Order[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.orderRepository.list(tenantId).pipe(map((r) => r.data));
  }

  getOrder(id: string): Observable<Order> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.orderRepository.getById(tenantId, id).pipe(map((r) => r.data));
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.orderRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.orderRepository.updateStatus(tenantId, id, status).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listPayments(): Observable<Payment[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.paymentRepository.list(tenantId).pipe(map((r) => r.data));
  }

  getPaymentByOrderId(orderId: string): Observable<Payment | null> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.paymentRepository.getByOrderId(tenantId, orderId).pipe(map((r) => r.data));
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Cash',
      CARD: 'Card',
      E_WALLET: 'GCash / Maya',
      BANK_TRANSFER: 'Bank Transfer',
    };
    return labels[method];
  }
}
