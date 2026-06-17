import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../api/api-response.model';
import { Role, ROLES } from '../constants/roles';
import { User } from '../models';
import { RegisterTenantDto } from '../models/dtos';
import { AuthRepository } from './auth.repository';
import { MockAuthRepository } from './mock-auth.repository';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly authRepository = inject(AuthRepository);
  private readonly userSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly currentUser = this.userSignal.asReadonly();
  readonly accessToken = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor() {
    this.restoreSession();
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await firstValueFrom(this.authRepository.login({ email, password }));
      this.userSignal.set(response.data.user);
      this.tokenSignal.set(response.data.accessToken);
      return response.data.user;
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  async register(dto: RegisterTenantDto): Promise<void> {
    try {
      await firstValueFrom(this.authRepository.register(dto));
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  async forgotPassword(email: string): Promise<string> {
    try {
      const response = await firstValueFrom(this.authRepository.forgotPassword({ email }));
      return response.data.message;
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  logout(): void {
    void firstValueFrom(this.authRepository.logout()).finally(() => {
      this.userSignal.set(null);
      this.tokenSignal.set(null);
      void this.router.navigate(['/login']);
    });
  }

  redirectByRole(role: Role): Promise<boolean> {
    if (role === ROLES.SUPER_ADMIN) {
      return this.router.navigate(['/admin/tenants']);
    }
    return this.router.navigate(['/tenant/dashboard']);
  }

  hasAnyRole(roles: Role[]): boolean {
    const currentRole = this.currentUser()?.role;
    return !!currentRole && roles.includes(currentRole);
  }

  private restoreSession(): void {
    const mockRepo = this.authRepository as MockAuthRepository;
    if (typeof mockRepo.readSession !== 'function') return;
    const session = mockRepo.readSession();
    if (session) {
      this.userSignal.set(session.user);
      this.tokenSignal.set(session.accessToken);
    }
  }

  private toAuthError(error: unknown): AuthError {
    if (error instanceof ApiError) {
      return new AuthError(error.message);
    }
    if (error instanceof AuthError) {
      return error;
    }
    return new AuthError('Unable to complete authentication.');
  }
}
