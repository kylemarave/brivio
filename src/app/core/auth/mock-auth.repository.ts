import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiError, ApiResponse } from '../api/api-response.model';
import { mockDelay } from '../api/mock-delay';
import { ROLES } from '../constants/roles';
import { AuthSession, LoginCredentials, User } from '../models';
import { ForgotPasswordDto, RegisterTenantDto } from '../models/dtos';
import { MockApiStore } from '../repositories/mock/mock-api.store';
import { AuthRepository } from './auth.repository';

const SESSION_KEY = 'brivio_session';

@Injectable()
export class MockAuthRepository extends AuthRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthSession>> {
    const email = credentials.email.trim().toLowerCase();
    if (!credentials.password.trim()) {
      throw new ApiError('Password is required.', 400);
    }
    const user = this.resolveUser(email);
    const session: AuthSession = {
      user,
      accessToken: `mock-token-${user.id}-${Date.now()}`,
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return mockDelay({ data: session });
  }

  register(dto: RegisterTenantDto): Observable<ApiResponse<{ message: string }>> {
    this.store.createTenantApplication(dto);
    return mockDelay({
      data: { message: 'Application submitted successfully.' },
    });
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<ApiResponse<{ message: string }>> {
    const email = dto.email.trim().toLowerCase();
    if (!email) throw new ApiError('Email is required.', 400);
    return mockDelay({
      data: { message: 'If an account exists, a reset link has been sent.' },
    });
  }

  logout(): Observable<ApiResponse<null>> {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return mockDelay({ data: null, message: 'Logged out.' });
  }

  me(token: string): Observable<ApiResponse<User>> {
    const session = this.readSession();
    if (!session || session.accessToken !== token) {
      throw new ApiError('Unauthorized.', 401);
    }
    return mockDelay({ data: session.user });
  }

  readSession(): AuthSession | null {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  private resolveUser(email: string): User {
    if (email.includes('admin')) {
      return {
        id: '1',
        name: 'Super Admin',
        email,
        role: ROLES.SUPER_ADMIN,
        status: 'ACTIVE',
      };
    }
    const tenant = this.store.getTenantByEmail(email);
    if (!tenant) {
      throw new ApiError('No account found for this email. Apply as a tenant first.', 404);
    }
    if (tenant.status === 'PENDING') {
      throw new ApiError('Your application is still pending approval.', 403);
    }
    if (tenant.status !== 'ACTIVE') {
      throw new ApiError('This tenant account is not active. Contact support.', 403);
    }
    return {
      id: `owner-${tenant.id}`,
      name: `${tenant.name} Owner`,
      email,
      role: ROLES.TENANT_OWNER,
      tenantId: tenant.id,
      status: 'ACTIVE',
    };
  }
}

export { SESSION_KEY };
