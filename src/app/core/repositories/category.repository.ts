import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Category } from '../models';
import { CreateCategoryDto, UpdateCategoryDto } from '../models/dtos';

export abstract class CategoryRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Category[]>>;
  abstract create(tenantId: string, dto: CreateCategoryDto): Observable<ApiResponse<Category>>;
  abstract update(tenantId: string, id: string, dto: UpdateCategoryDto): Observable<ApiResponse<Category>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
}
