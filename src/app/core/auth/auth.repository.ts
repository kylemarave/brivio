import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { AuthSession, LoginCredentials, User } from '../models';
import { ForgotPasswordDto, RegisterTenantDto } from '../models/dtos';

export abstract class AuthRepository {
  abstract login(credentials: LoginCredentials): Observable<ApiResponse<AuthSession>>;
  abstract register(dto: RegisterTenantDto): Observable<ApiResponse<{ message: string }>>;
  abstract forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<{ message: string }>>;
  abstract logout(): Observable<ApiResponse<null>>;
  abstract me(token: string): Observable<ApiResponse<User>>;
}
