import { Injectable } from '@angular/core';
import { paginate } from '../../api/api-response.model';
import { mockDelay } from '../../api/mock-delay';
import { TenantQueryParams } from '../../api/query-params.model';
import { AddonRepository } from '../addon.repository';
import { AttendanceRepository } from '../attendance.repository';
import { CategoryRepository } from '../category.repository';
import { CouponRepository } from '../coupon.repository';
import { CustomerRepository } from '../customer.repository';
import { EmployeeRepository } from '../employee.repository';
import { InventoryRepository } from '../inventory.repository';
import { LoyaltyRepository } from '../loyalty.repository';
import { OrderRepository } from '../order.repository';
import { PaymentRepository } from '../payment.repository';
import { ProductRepository } from '../product.repository';
import { PromotionRepository } from '../promotion.repository';
import { ReportRepository } from '../report.repository';
import { ScheduleRepository } from '../schedule.repository';
import { SettingsRepository } from '../settings.repository';
import { StoreProfileRepository } from '../store-profile.repository';
import { SupplierRepository } from '../supplier.repository';
import { TenantRepository } from '../tenant.repository';
import { VariantRepository } from '../variant.repository';
import { MockApiStore } from './mock-api.store';

function wrap<T>(fn: () => T) {
  return mockDelay({ data: fn() });
}

function wrapNull(fn: () => void) {
  fn();
  return mockDelay({ data: null as null });
}

@Injectable()
export class MockTenantRepository extends TenantRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(params?: TenantQueryParams) {
    const items = this.store.listTenants(params?.status);
    return mockDelay(paginate(items, params?.page ?? 1, params?.limit ?? 100));
  }
  getById(id: string) {
    return wrap(() => this.store.getTenant(id));
  }
  getOverview(id: string) {
    return wrap(() => this.store.getAdminTenantOverview(id));
  }
  update(id: string, dto: Parameters<TenantRepository['update']>[1]) {
    return wrap(() => this.store.updateTenant(id, dto));
  }
  getDashboardStats() {
    return wrap(() => this.store.getAdminDashboardStats());
  }
}

@Injectable()
export class MockProductRepository extends ProductRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listProducts(tenantId));
  }
  create(tenantId: string, dto: Parameters<ProductRepository['create']>[1]) {
    return wrap(() => this.store.createProduct(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<ProductRepository['update']>[2]) {
    return wrap(() => this.store.updateProduct(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteProduct(tenantId, id));
  }
}

@Injectable()
export class MockCategoryRepository extends CategoryRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listCategories(tenantId));
  }
  create(tenantId: string, dto: Parameters<CategoryRepository['create']>[1]) {
    return wrap(() => this.store.createCategory(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<CategoryRepository['update']>[2]) {
    return wrap(() => this.store.updateCategory(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteCategory(tenantId, id));
  }
}

@Injectable()
export class MockOrderRepository extends OrderRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listOrders(tenantId));
  }
  getById(tenantId: string, id: string) {
    return wrap(() => this.store.getOrder(tenantId, id));
  }
  create(tenantId: string, dto: Parameters<OrderRepository['create']>[1]) {
    return wrap(() => this.store.createOrder(tenantId, dto));
  }
  updateStatus(tenantId: string, id: string, status: Parameters<OrderRepository['updateStatus']>[2]) {
    return wrap(() => this.store.updateOrderStatus(tenantId, id, status));
  }
}

@Injectable()
export class MockCustomerRepository extends CustomerRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listCustomers(tenantId));
  }
  create(tenantId: string, dto: Parameters<CustomerRepository['create']>[1]) {
    return wrap(() => this.store.createCustomer(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<CustomerRepository['update']>[2]) {
    return wrap(() => this.store.updateCustomer(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteCustomer(tenantId, id));
  }
}

@Injectable()
export class MockInventoryRepository extends InventoryRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listInventory(tenantId));
  }
  update(tenantId: string, id: string, dto: Parameters<InventoryRepository['update']>[2]) {
    return wrap(() => this.store.updateInventory(tenantId, id, dto));
  }
}

@Injectable()
export class MockSupplierRepository extends SupplierRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listSuppliers(tenantId));
  }
  create(tenantId: string, dto: Parameters<SupplierRepository['create']>[1]) {
    return wrap(() => this.store.createSupplier(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<SupplierRepository['update']>[2]) {
    return wrap(() => this.store.updateSupplier(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteSupplier(tenantId, id));
  }
}

@Injectable()
export class MockEmployeeRepository extends EmployeeRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listEmployees(tenantId));
  }
  create(tenantId: string, dto: Parameters<EmployeeRepository['create']>[1]) {
    return wrap(() => this.store.createEmployee(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<EmployeeRepository['update']>[2]) {
    return wrap(() => this.store.updateEmployee(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteEmployee(tenantId, id));
  }
  suspend(tenantId: string, id: string) {
    return wrap(() => this.store.suspendEmployee(tenantId, id));
  }
}

@Injectable()
export class MockPaymentRepository extends PaymentRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listPayments(tenantId));
  }
  getByOrderId(tenantId: string, orderId: string) {
    return wrap(() => this.store.getPaymentByOrderId(tenantId, orderId) ?? null);
  }
}

@Injectable()
export class MockStoreProfileRepository extends StoreProfileRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  get(tenantId: string) {
    return wrap(() => this.store.getStoreProfile(tenantId));
  }
  update(tenantId: string, dto: Parameters<StoreProfileRepository['update']>[1]) {
    return wrap(() => this.store.updateStoreProfile(tenantId, dto));
  }
}

@Injectable()
export class MockSettingsRepository extends SettingsRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  get(tenantId: string) {
    return wrap(() => this.store.getTenantSettings(tenantId));
  }
  update(tenantId: string, dto: Parameters<SettingsRepository['update']>[1]) {
    return wrap(() => this.store.updateTenantSettings(tenantId, dto));
  }
}

@Injectable()
export class MockVariantRepository extends VariantRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listVariants(tenantId));
  }
  create(tenantId: string, dto: Parameters<VariantRepository['create']>[1]) {
    return wrap(() => this.store.createVariant(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<VariantRepository['update']>[2]) {
    return wrap(() => this.store.updateVariant(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteVariant(tenantId, id));
  }
}

@Injectable()
export class MockAddonRepository extends AddonRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listAddons(tenantId));
  }
  create(tenantId: string, dto: Parameters<AddonRepository['create']>[1]) {
    return wrap(() => this.store.createAddon(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<AddonRepository['update']>[2]) {
    return wrap(() => this.store.updateAddon(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteAddon(tenantId, id));
  }
}

@Injectable()
export class MockPromotionRepository extends PromotionRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listPromotions(tenantId));
  }
  create(tenantId: string, dto: Parameters<PromotionRepository['create']>[1]) {
    return wrap(() => this.store.createPromotion(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<PromotionRepository['update']>[2]) {
    return wrap(() => this.store.updatePromotion(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deletePromotion(tenantId, id));
  }
}

@Injectable()
export class MockCouponRepository extends CouponRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listCoupons(tenantId));
  }
  create(tenantId: string, dto: Parameters<CouponRepository['create']>[1]) {
    return wrap(() => this.store.createCoupon(tenantId, dto));
  }
  update(tenantId: string, id: string, dto: Parameters<CouponRepository['update']>[2]) {
    return wrap(() => this.store.updateCoupon(tenantId, id, dto));
  }
  delete(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteCoupon(tenantId, id));
  }
}

@Injectable()
export class MockLoyaltyRepository extends LoyaltyRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  get(tenantId: string) {
    return wrap(() => this.store.getLoyaltyProgram(tenantId));
  }
  update(tenantId: string, dto: Parameters<LoyaltyRepository['update']>[1]) {
    return wrap(() => this.store.updateLoyaltyProgram(tenantId, dto));
  }
}

@Injectable()
export class MockAttendanceRepository extends AttendanceRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  list(tenantId: string) {
    return wrap(() => this.store.listAttendance(tenantId));
  }
  clockIn(tenantId: string, employeeId: string) {
    return wrap(() => this.store.clockIn(tenantId, employeeId));
  }
  clockOut(tenantId: string, employeeId: string) {
    return wrap(() => this.store.clockOut(tenantId, employeeId));
  }
}

@Injectable()
export class MockScheduleRepository extends ScheduleRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  listShifts(tenantId: string) {
    return wrap(() => this.store.listShifts(tenantId));
  }
  createShift(tenantId: string, dto: Parameters<ScheduleRepository['createShift']>[1]) {
    return wrap(() => this.store.createShift(tenantId, dto));
  }
  updateShift(tenantId: string, id: string, dto: Parameters<ScheduleRepository['updateShift']>[2]) {
    return wrap(() => this.store.updateShift(tenantId, id, dto));
  }
  deleteShift(tenantId: string, id: string) {
    return wrapNull(() => this.store.deleteShift(tenantId, id));
  }
  listLeaveRequests(tenantId: string) {
    return wrap(() => this.store.listLeaveRequests(tenantId));
  }
  updateLeaveRequest(tenantId: string, id: string, dto: Parameters<ScheduleRepository['updateLeaveRequest']>[2]) {
    return wrap(() => this.store.updateLeaveRequest(tenantId, id, dto));
  }
}

@Injectable()
export class MockReportRepository extends ReportRepository {
  constructor(private readonly store: MockApiStore) {
    super();
  }
  getTenantDashboardStats(tenantId: string) {
    return wrap(() => this.store.getTenantDashboardStats(tenantId));
  }
  getReportSummary(tenantId: string) {
    return wrap(() => this.store.getReportSummary(tenantId));
  }
}
