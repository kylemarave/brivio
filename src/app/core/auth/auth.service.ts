import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ROLES, Role } from '../constants/roles';
import { MockDataService } from '../services/mock-data.service';
import { User } from '../models';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(null);

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(
    private readonly router: Router,
    private readonly mockDataService: MockDataService,
  ) {}

  login(email: string, _password: string): User {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.resolveUser(normalizedEmail);
    this.userSignal.set(user);
    return user;
  }

  logout(): void {
    this.userSignal.set(null);
    void this.router.navigate(['/login']);
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

  private resolveUser(email: string): User {
    if (email.includes('admin')) {
      return this.buildUser('1', 'Super Admin', email, ROLES.SUPER_ADMIN);
    }

    const tenant = this.mockDataService.getTenantByEmail(email);
    if (!tenant) {
      throw new AuthError('No account found for this email. Apply as a tenant first.');
    }
    if (tenant.status === 'PENDING') {
      throw new AuthError('Your application is still pending approval.');
    }
    if (tenant.status !== 'ACTIVE') {
      throw new AuthError('This tenant account is not active. Contact support.');
    }

    return this.buildUser(`owner-${tenant.id}`, `${tenant.name} Owner`, email, ROLES.TENANT_OWNER, tenant.id);
  }

  private buildUser(
    id: string,
    name: string,
    email: string,
    role: Role,
    tenantId?: string,
  ): User {
    return {
      id,
      name,
      email,
      role,
      tenantId,
      status: 'ACTIVE',
    };
  }
}
