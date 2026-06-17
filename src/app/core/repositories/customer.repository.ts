import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Customer } from '../models';
import { CreateCustomerDto, UpdateCustomerDto } from '../models/dtos';

export abstract class CustomerRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Customer[]>>;
  abstract create(tenantId: string, dto: CreateCustomerDto): Observable<ApiResponse<Customer>>;
  abstract update(tenantId: string, id: string, dto: UpdateCustomerDto): Observable<ApiResponse<Customer>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
