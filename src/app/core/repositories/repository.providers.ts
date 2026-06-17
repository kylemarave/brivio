import { Provider } from '@angular/core';
import { AuthRepository } from '../auth/auth.repository';
import { MockAuthRepository } from '../auth/mock-auth.repository';
import { AddonRepository } from './addon.repository';
import { AttendanceRepository } from './attendance.repository';
import { CategoryRepository } from './category.repository';
import { CouponRepository } from './coupon.repository';
import { CustomerRepository } from './customer.repository';
import { EmployeeRepository } from './employee.repository';
import { InventoryRepository } from './inventory.repository';
import { LoyaltyRepository } from './loyalty.repository';
import {
  MockAddonRepository,
  MockAttendanceRepository,
  MockCategoryRepository,
  MockCouponRepository,
  MockCustomerRepository,
  MockEmployeeRepository,
  MockInventoryRepository,
  MockLoyaltyRepository,
  MockOrderRepository,
  MockPaymentRepository,
  MockProductRepository,
  MockPromotionRepository,
  MockReportRepository,
  MockScheduleRepository,
  MockSettingsRepository,
  MockStoreProfileRepository,
  MockSupplierRepository,
  MockTenantRepository,
  MockVariantRepository,
} from './mock/mock-repositories';
import { OrderRepository } from './order.repository';
import { PaymentRepository } from './payment.repository';
import { ProductRepository } from './product.repository';
import { PromotionRepository } from './promotion.repository';
import { ReportRepository } from './report.repository';
import { ScheduleRepository } from './schedule.repository';
import { SettingsRepository } from './settings.repository';
import { StoreProfileRepository } from './store-profile.repository';
import { SupplierRepository } from './supplier.repository';
import { TenantRepository } from './tenant.repository';
import { VariantRepository } from './variant.repository';

export const repositoryProviders: Provider[] = [
  { provide: AuthRepository, useClass: MockAuthRepository },
  { provide: TenantRepository, useClass: MockTenantRepository },
  { provide: ProductRepository, useClass: MockProductRepository },
  { provide: CategoryRepository, useClass: MockCategoryRepository },
  { provide: OrderRepository, useClass: MockOrderRepository },
  { provide: CustomerRepository, useClass: MockCustomerRepository },
  { provide: InventoryRepository, useClass: MockInventoryRepository },
  { provide: SupplierRepository, useClass: MockSupplierRepository },
  { provide: EmployeeRepository, useClass: MockEmployeeRepository },
  { provide: PaymentRepository, useClass: MockPaymentRepository },
  { provide: StoreProfileRepository, useClass: MockStoreProfileRepository },
  { provide: SettingsRepository, useClass: MockSettingsRepository },
  { provide: VariantRepository, useClass: MockVariantRepository },
  { provide: AddonRepository, useClass: MockAddonRepository },
  { provide: PromotionRepository, useClass: MockPromotionRepository },
  { provide: CouponRepository, useClass: MockCouponRepository },
  { provide: LoyaltyRepository, useClass: MockLoyaltyRepository },
  { provide: AttendanceRepository, useClass: MockAttendanceRepository },
  { provide: ScheduleRepository, useClass: MockScheduleRepository },
  { provide: ReportRepository, useClass: MockReportRepository },
];
