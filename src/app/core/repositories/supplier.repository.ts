import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Supplier } from '../models';
import { CreateSupplierDto, UpdateSupplierDto } from '../models/dtos';

export abstract class SupplierRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Supplier[]>>;
  abstract create(tenantId: string, dto: CreateSupplierDto): Observable<ApiResponse<Supplier>>;
  abstract update(tenantId: string, id: string, dto: UpdateSupplierDto): Observable<ApiResponse<Supplier>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
