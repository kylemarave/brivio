import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { StoreProfile, TenantSettings } from '../../../core/models';
import { UpdateStoreProfileDto, UpdateTenantSettingsDto } from '../../../core/models/dtos';
import { SettingsRepository } from '../../../core/repositories/settings.repository';
import { StoreProfileRepository } from '../../../core/repositories/store-profile.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantStoreService {
  constructor(
    private readonly storeProfileRepository: StoreProfileRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  getStoreProfile(): Observable<StoreProfile> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.storeProfileRepository.get(tenantId).pipe(map((r) => r.data));
  }

  updateStoreProfile(dto: UpdateStoreProfileDto): Observable<StoreProfile> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.storeProfileRepository.update(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  getSettings(): Observable<TenantSettings> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.settingsRepository.get(tenantId).pipe(map((r) => r.data));
  }

  updateSettings(dto: UpdateTenantSettingsDto): Observable<TenantSettings> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.settingsRepository.update(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
