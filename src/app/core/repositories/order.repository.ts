import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Order, OrderStatus } from '../models';
import { CreateOrderDto } from '../models/dtos';

export abstract class OrderRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Order[]>>;
  abstract getById(tenantId: string, id: string): Observable<ApiResponse<Order>>;
  abstract create(tenantId: string, dto: CreateOrderDto): Observable<ApiResponse<Order>>;
  abstract updateStatus(tenantId: string, id: string, status: OrderStatus): Observable<ApiResponse<Order>>;
}
