import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Coupon, LoyaltyProgram, Promotion } from '../../../core/models';
import {
  CreateCouponDto,
  CreatePromotionDto,
  UpdateCouponDto,
  UpdateLoyaltyProgramDto,
  UpdatePromotionDto,
} from '../../../core/models/dtos';
import { CouponRepository } from '../../../core/repositories/coupon.repository';
import { LoyaltyRepository } from '../../../core/repositories/loyalty.repository';
import { PromotionRepository } from '../../../core/repositories/promotion.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantMarketingService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly couponRepository: CouponRepository,
    private readonly loyaltyRepository: LoyaltyRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listPromotions(): Observable<Promotion[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.promotionRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createPromotion(dto: CreatePromotionDto): Observable<Promotion> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.promotionRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updatePromotion(id: string, dto: UpdatePromotionDto): Observable<Promotion> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.promotionRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deletePromotion(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.promotionRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listCoupons(): Observable<Coupon[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.couponRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createCoupon(dto: CreateCouponDto): Observable<Coupon> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.couponRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateCoupon(id: string, dto: UpdateCouponDto): Observable<Coupon> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.couponRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteCoupon(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.couponRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  getLoyaltyProgram(): Observable<LoyaltyProgram> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.loyaltyRepository.get(tenantId).pipe(map((r) => r.data));
  }

  updateLoyaltyProgram(dto: UpdateLoyaltyProgramDto): Observable<LoyaltyProgram> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.loyaltyRepository.update(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
