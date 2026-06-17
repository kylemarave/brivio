import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { Employee } from '../models';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../models/dtos';

export abstract class EmployeeRepository {
  abstract list(tenantId: string): Observable<ApiResponse<Employee[]>>;
  abstract create(tenantId: string, dto: CreateEmployeeDto): Observable<ApiResponse<Employee>>;
  abstract update(tenantId: string, id: string, dto: UpdateEmployeeDto): Observable<ApiResponse<Employee>>;
  abstract delete(tenantId: string, id: string): Observable<ApiResponse<null>>;
  abstract suspend(tenantId: string, id: string): Observable<ApiResponse<Employee>>;
}
