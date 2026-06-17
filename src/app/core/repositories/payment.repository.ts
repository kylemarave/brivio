import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Payment } from '../models';

export abstract class PaymentRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Payment[]>>;
  abstract getByOrderId(tenantId: string, orderId: string): Observable<ApiResponse<Payment | null>>;
}
