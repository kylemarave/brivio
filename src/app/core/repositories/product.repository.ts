import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Product } from '../models';
import { CreateProductDto, UpdateProductDto } from '../models/dtos';

export abstract class ProductRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Product[]>>;
  abstract create(tenantId: string, dto: CreateProductDto): Observable<ApiResponse<Product>>;
  abstract update(tenantId: string, id: string, dto: UpdateProductDto): Observable<ApiResponse<Product>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
