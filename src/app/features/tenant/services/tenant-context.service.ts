import { Injectable, signal } from '@angular/core';
import { ApiError } from '../../../core/api/api-response.model';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly refreshCounter = signal(0);

  constructor(private readonly authService: AuthService) {}

  requireTenantId(): string {
    const tenantId = this.authService.currentUser()?.tenantId;
    if (!tenantId) {
      throw new ApiError('Tenant context required.', 403);
    }
    return tenantId;
  }

  bumpRefresh(): void {
    this.refreshCounter.update((n) => n + 1);
  }

  refreshTick(): number {
    return this.refreshCounter();
  }
}
