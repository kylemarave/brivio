import { Injectable } from '@angular/core';
import { ApiError } from '../../api/api-response.model';
import {
  Addon,
  AdminDashboardStats,
  AdminTenantOverview,
  AdminTenantWorkspaceStats,
  AttendanceRecord,
  Category,
  Coupon,
  Customer,
  Employee,
  Inventory,
  LeaveRequest,
  LoyaltyProgram,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  Product,
  Promotion,
  ReportSummary,
  Shift,
  StoreProfile,
  SubscriptionPlan,
  Supplier,
  Tenant,
  TenantDashboardStats,
  TenantSettings,
  Variant,
} from '../../models';
import {
  CreateAddonDto,
  CreateCategoryDto,
  CreateCouponDto,
  CreateCustomerDto,
  CreateEmployeeDto,
  CreateOrderDto,
  CreatePromotionDto,
  CreateShiftDto,
  CreateSupplierDto,
  CreateVariantDto,
  RegisterTenantDto,
  UpdateAddonDto,
  UpdateCategoryDto,
  UpdateCouponDto,
  UpdateCustomerDto,
  UpdateEmployeeDto,
  UpdateInventoryDto,
  UpdateLeaveRequestDto,
  UpdateLoyaltyProgramDto,
  UpdateProductDto,
  UpdatePromotionDto,
  UpdateShiftDto,
  UpdateStoreProfileDto,
  UpdateSupplierDto,
  UpdateTenantDto,
  UpdateTenantSettingsDto,
  UpdateVariantDto,
} from '../../models/dtos';
import { CreateProductDto } from '../../models/dtos';

@Injectable({ providedIn: 'root' })
export class MockApiStore {
  private tenants: Tenant[] = [];
  private categories: Category[] = [];
  private products: Product[] = [];
  private customers: Customer[] = [];
  private employees: Employee[] = [];
  private inventory: Inventory[] = [];
  private orders: Order[] = [];
  private suppliers: Supplier[] = [];
  private payments: Payment[] = [];
  private variants: Variant[] = [];
  private addons: Addon[] = [];
  private promotions: Promotion[] = [];
  private coupons: Coupon[] = [];
  private storeProfiles = new Map<string, StoreProfile>();
  private tenantSettings = new Map<string, TenantSettings>();
  private loyaltyPrograms = new Map<string, LoyaltyProgram>();
  private attendance: AttendanceRecord[] = [];
  private shifts: Shift[] = [];
  private leaveRequests: LeaveRequest[] = [];

  constructor() {
    this.seed();
  }

  assertTenantAccess(resourceTenantId: string, tenantId: string): void {
    if (resourceTenantId !== tenantId) {
      throw new ApiError('Resource not found for this tenant.', 404);
    }
  }

  // --- Tenants (admin) ---
  listTenants(status?: Tenant['status'] | 'ALL'): Tenant[] {
    const items = [...this.tenants].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (!status || status === 'ALL') return items.map((t) => ({ ...t }));
    return items.filter((t) => t.status === status).map((t) => ({ ...t }));
  }

  getTenant(id: string): Tenant {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new ApiError('Tenant not found.', 404);
    return { ...tenant };
  }

  getAdminTenantOverview(id: string): AdminTenantOverview {
    const tenant = this.getTenant(id);
    const tenantId = tenant.id;
    const orders = this.listOrders(tenantId);
    const today = new Date().toISOString().slice(0, 10);
    const workspace: AdminTenantWorkspaceStats = {
      productCount: this.listProducts(tenantId).length,
      orderCount: orders.length,
      customerCount: this.listCustomers(tenantId).length,
      employeeCount: this.listEmployees(tenantId).length,
      supplierCount: this.listSuppliers(tenantId).length,
      pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      lowStockAlerts: this.listInventory(tenantId).filter((i) => i.quantity <= i.reorderLevel).length,
      monthlyRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      todaysOrders: orders.filter((o) => o.createdAt.startsWith(today)).length,
    };
    return {
      tenant,
      storeProfile: this.getStoreProfile(tenantId),
      settings: this.getTenantSettings(tenantId),
      workspace,
      recentOrders: orders.slice(0, 6),
    };
  }

  getTenantByEmail(email: string): Tenant | undefined {
    const normalized = email.trim().toLowerCase();
    const tenant = this.tenants.find((t) => t.email.toLowerCase() === normalized);
    return tenant ? { ...tenant } : undefined;
  }

  createTenantApplication(input: RegisterTenantDto): Tenant {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (this.getTenantByEmail(normalizedEmail)) {
      throw new ApiError('An application or account with this email already exists.', 409);
    }
    const created = this.buildTenant(
      `t-${Date.now()}`,
      input.name.trim(),
      input.plan,
      'PENDING',
      normalizedEmail,
      input.phone.trim(),
      0,
      new Date().toISOString(),
    );
    this.tenants.unshift(created);
    this.initTenantDefaults(created);
    return { ...created };
  }

  updateTenant(id: string, updates: UpdateTenantDto): Tenant {
    const index = this.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new ApiError('Tenant not found.', 404);
    const updated = { ...this.tenants[index], ...updates };
    this.tenants = [...this.tenants.slice(0, index), updated, ...this.tenants.slice(index + 1)];
    return { ...updated };
  }

  getAdminDashboardStats(): AdminDashboardStats {
    return {
      totalTenants: this.tenants.length,
      activeTenants: this.tenants.filter((t) => t.status === 'ACTIVE').length,
      pendingApplications: this.tenants.filter((t) => t.status === 'PENDING').length,
      inactiveTenants: this.tenants.filter((t) => t.status === 'INACTIVE').length,
    };
  }

  getTenantDashboardStats(tenantId: string): TenantDashboardStats {
    const tenantOrders = this.listOrders(tenantId);
    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = tenantOrders.filter((o) => o.createdAt.startsWith(today));
    return {
      todaysSales: todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      todaysOrders: todaysOrders.length,
      monthlyRevenue: tenantOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      activeCustomers: this.listCustomers(tenantId).filter((c) => c.status === 'ACTIVE').length,
      lowStockAlerts: this.listInventory(tenantId).filter((i) => i.quantity <= i.reorderLevel).length,
      pendingOrders: tenantOrders.filter((o) => o.status === 'PENDING').length,
    };
  }

  getReportSummary(tenantId: string): ReportSummary {
    const tenantOrders = this.listOrders(tenantId);
    const productCounts = new Map<string, { name: string; quantity: number }>();
    for (const order of tenantOrders) {
      for (const item of order.items) {
        const existing = productCounts.get(item.productId) ?? { name: item.productName, quantity: 0 };
        existing.quantity += item.quantity;
        productCounts.set(item.productId, existing);
      }
    }
    const topProducts = [...productCounts.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const recentSales = dayLabels.map((label, i) => ({
      label,
      amount: tenantOrders.filter((_, idx) => idx % 7 === i).reduce((s, o) => s + o.totalAmount, 0),
    }));
    return {
      totalOrders: tenantOrders.length,
      totalRevenue: tenantOrders.reduce((s, o) => s + o.totalAmount, 0),
      lowStockCount: this.listInventory(tenantId).filter((i) => i.quantity <= i.reorderLevel).length,
      customerCount: this.listCustomers(tenantId).length,
      employeeCount: this.listEmployees(tenantId).length,
      topProducts,
      recentSales,
    };
  }

  // --- Products ---
  listProducts(tenantId: string): Product[] {
    return this.products.filter((p) => p.tenantId === tenantId).map((p) => ({ ...p }));
  }

  createProduct(tenantId: string, dto: CreateProductDto): Product {
    const created: Product = { ...dto, id: `p-${Date.now()}`, tenantId };
    this.products = [created, ...this.products];
    return { ...created };
  }

  updateProduct(tenantId: string, id: string, dto: UpdateProductDto): Product {
    const index = this.products.findIndex((p) => p.id === id && p.tenantId === tenantId);
    if (index === -1) throw new ApiError('Product not found.', 404);
    const updated = { ...this.products[index], ...dto };
    this.products = [...this.products.slice(0, index), updated, ...this.products.slice(index + 1)];
    return { ...updated };
  }

  deleteProduct(tenantId: string, id: string): void {
    const prev = this.products.length;
    this.products = this.products.filter((p) => !(p.id === id && p.tenantId === tenantId));
    if (this.products.length === prev) throw new ApiError('Product not found.', 404);
  }

  // --- Categories ---
  listCategories(tenantId: string): Category[] {
    return this.categories.filter((c) => c.tenantId === tenantId).map((c) => ({ ...c }));
  }

  createCategory(tenantId: string, dto: CreateCategoryDto): Category {
    const created: Category = { ...dto, id: `cat-${Date.now()}`, tenantId };
    this.categories = [created, ...this.categories];
    return { ...created };
  }

  updateCategory(tenantId: string, id: string, dto: UpdateCategoryDto): Category {
    const index = this.categories.findIndex((c) => c.id === id && c.tenantId === tenantId);
    if (index === -1) throw new ApiError('Category not found.', 404);
    const updated = { ...this.categories[index], ...dto };
    this.categories = [...this.categories.slice(0, index), updated, ...this.categories.slice(index + 1)];
    return { ...updated };
  }

  deleteCategory(tenantId: string, id: string): void {
    const prev = this.categories.length;
    this.categories = this.categories.filter((c) => !(c.id === id && c.tenantId === tenantId));
    if (this.categories.length === prev) throw new ApiError('Category not found.', 404);
  }

  // --- Customers ---
  listCustomers(tenantId: string): Customer[] {
    return this.customers.filter((c) => c.tenantId === tenantId).map((c) => ({ ...c }));
  }

  createCustomer(tenantId: string, dto: CreateCustomerDto): Customer {
    const created: Customer = { ...dto, id: `c-${Date.now()}`, tenantId };
    this.customers = [created, ...this.customers];
    return { ...created };
  }

  updateCustomer(tenantId: string, id: string, dto: UpdateCustomerDto): Customer {
    const index = this.customers.findIndex((c) => c.id === id && c.tenantId === tenantId);
    if (index === -1) throw new ApiError('Customer not found.', 404);
    const updated = { ...this.customers[index], ...dto };
    this.customers = [...this.customers.slice(0, index), updated, ...this.customers.slice(index + 1)];
    return { ...updated };
  }

  deleteCustomer(tenantId: string, id: string): void {
    const prev = this.customers.length;
    this.customers = this.customers.filter((c) => !(c.id === id && c.tenantId === tenantId));
    if (this.customers.length === prev) throw new ApiError('Customer not found.', 404);
  }

  // --- Orders ---
  listOrders(tenantId: string): Order[] {
    return this.orders
      .filter((o) => o.tenantId === tenantId)
      .map((o) => ({ ...o, items: [...o.items] }));
  }

  getOrder(tenantId: string, id: string): Order {
    const order = this.orders.find((o) => o.id === id && o.tenantId === tenantId);
    if (!order) throw new ApiError('Order not found.', 404);
    return { ...order, items: [...order.items] };
  }

  createOrder(tenantId: string, dto: CreateOrderDto): Order {
    const products = this.listProducts(tenantId);
    const items: OrderItem[] = dto.items.map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) throw new ApiError(`Product ${line.productId} not found.`, 404);
      return {
        productId: product.id,
        productName: product.name,
        quantity: line.quantity,
        unitPrice: product.price,
        total: product.price * line.quantity,
      };
    });
    const order: Order = {
      id: `o-${Date.now()}`,
      tenantId,
      customerId: dto.customerId,
      orderNumber: `BR-${10000 + this.orders.length}`,
      status: 'PENDING',
      totalAmount: items.reduce((s, i) => s + i.total, 0),
      createdAt: new Date().toISOString(),
      items,
    };
    this.orders = [order, ...this.orders];
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      tenantId,
      orderId: order.id,
      amount: order.totalAmount,
      method: dto.paymentMethod,
      status: 'PENDING',
      createdAt: order.createdAt,
    };
    this.payments = [payment, ...this.payments];
    return { ...order, items: [...items] };
  }

  updateOrderStatus(tenantId: string, id: string, status: OrderStatus): Order {
    const index = this.orders.findIndex((o) => o.id === id && o.tenantId === tenantId);
    if (index === -1) throw new ApiError('Order not found.', 404);
    const updated = { ...this.orders[index], status };
    this.orders = [...this.orders.slice(0, index), updated, ...this.orders.slice(index + 1)];
    if (status === 'COMPLETED') {
      const payIndex = this.payments.findIndex((p) => p.orderId === id && p.tenantId === tenantId);
      if (payIndex !== -1) {
        this.payments[payIndex] = { ...this.payments[payIndex], status: 'PAID' };
      }
    }
    return { ...updated, items: [...updated.items] };
  }

  // --- Inventory ---
  listInventory(tenantId: string): Inventory[] {
    return this.inventory.filter((i) => i.tenantId === tenantId).map((i) => ({ ...i }));
  }

  updateInventory(tenantId: string, id: string, dto: UpdateInventoryDto): Inventory {
    const index = this.inventory.findIndex((i) => i.id === id && i.tenantId === tenantId);
    if (index === -1) throw new ApiError('Inventory item not found.', 404);
    const current = this.inventory[index];
    const quantity = Math.max(0, dto.quantity);
    const updated: Inventory = {
      ...current,
      quantity,
      status: quantity <= current.reorderLevel ? 'PENDING' : 'ACTIVE',
    };
    this.inventory = [...this.inventory.slice(0, index), updated, ...this.inventory.slice(index + 1)];
    return { ...updated };
  }

  // --- Suppliers ---
  listSuppliers(tenantId: string): Supplier[] {
    return this.suppliers.filter((s) => s.tenantId === tenantId).map((s) => ({ ...s }));
  }

  createSupplier(tenantId: string, dto: CreateSupplierDto): Supplier {
    const created: Supplier = { ...dto, id: `sup-${Date.now()}`, tenantId };
    this.suppliers = [created, ...this.suppliers];
    return { ...created };
  }

  updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto): Supplier {
    const index = this.suppliers.findIndex((s) => s.id === id && s.tenantId === tenantId);
    if (index === -1) throw new ApiError('Supplier not found.', 404);
    const updated = { ...this.suppliers[index], ...dto };
    this.suppliers = [...this.suppliers.slice(0, index), updated, ...this.suppliers.slice(index + 1)];
    return { ...updated };
  }

  deleteSupplier(tenantId: string, id: string): void {
    const prev = this.suppliers.length;
    this.suppliers = this.suppliers.filter((s) => !(s.id === id && s.tenantId === tenantId));
    if (this.suppliers.length === prev) throw new ApiError('Supplier not found.', 404);
  }

  // --- Employees ---
  listEmployees(tenantId: string): Employee[] {
    return this.employees.filter((e) => e.tenantId === tenantId).map((e) => ({ ...e }));
  }

  createEmployee(tenantId: string, dto: CreateEmployeeDto): Employee {
    const created: Employee = { ...dto, id: `e-${Date.now()}`, tenantId };
    this.employees = [created, ...this.employees];
    return { ...created };
  }

  updateEmployee(tenantId: string, id: string, dto: UpdateEmployeeDto): Employee {
    const index = this.employees.findIndex((e) => e.id === id && e.tenantId === tenantId);
    if (index === -1) throw new ApiError('Employee not found.', 404);
    const updated = { ...this.employees[index], ...dto };
    this.employees = [...this.employees.slice(0, index), updated, ...this.employees.slice(index + 1)];
    return { ...updated };
  }

  deleteEmployee(tenantId: string, id: string): void {
    const prev = this.employees.length;
    this.employees = this.employees.filter((e) => !(e.id === id && e.tenantId === tenantId));
    if (this.employees.length === prev) throw new ApiError('Employee not found.', 404);
  }

  suspendEmployee(tenantId: string, id: string): Employee {
    return this.updateEmployee(tenantId, id, { status: 'INACTIVE' });
  }

  // --- Payments ---
  listPayments(tenantId: string): Payment[] {
    return this.payments.filter((p) => p.tenantId === tenantId).map((p) => ({ ...p }));
  }

  getPaymentByOrderId(tenantId: string, orderId: string): Payment | undefined {
    return this.payments.find((p) => p.tenantId === tenantId && p.orderId === orderId);
  }

  // --- Variants ---
  listVariants(tenantId: string): Variant[] {
    return this.variants.filter((v) => v.tenantId === tenantId).map((v) => ({ ...v }));
  }

  createVariant(tenantId: string, dto: CreateVariantDto): Variant {
    const created: Variant = { ...dto, id: `var-${Date.now()}`, tenantId };
    this.variants = [created, ...this.variants];
    return { ...created };
  }

  updateVariant(tenantId: string, id: string, dto: UpdateVariantDto): Variant {
    const index = this.variants.findIndex((v) => v.id === id && v.tenantId === tenantId);
    if (index === -1) throw new ApiError('Variant not found.', 404);
    const updated = { ...this.variants[index], ...dto };
    this.variants = [...this.variants.slice(0, index), updated, ...this.variants.slice(index + 1)];
    return { ...updated };
  }

  deleteVariant(tenantId: string, id: string): void {
    const prev = this.variants.length;
    this.variants = this.variants.filter((v) => !(v.id === id && v.tenantId === tenantId));
    if (this.variants.length === prev) throw new ApiError('Variant not found.', 404);
  }

  // --- Addons ---
  listAddons(tenantId: string): Addon[] {
    return this.addons.filter((a) => a.tenantId === tenantId).map((a) => ({ ...a }));
  }

  createAddon(tenantId: string, dto: CreateAddonDto): Addon {
    const created: Addon = { ...dto, id: `add-${Date.now()}`, tenantId };
    this.addons = [created, ...this.addons];
    return { ...created };
  }

  updateAddon(tenantId: string, id: string, dto: UpdateAddonDto): Addon {
    const index = this.addons.findIndex((a) => a.id === id && a.tenantId === tenantId);
    if (index === -1) throw new ApiError('Add-on not found.', 404);
    const updated = { ...this.addons[index], ...dto };
    this.addons = [...this.addons.slice(0, index), updated, ...this.addons.slice(index + 1)];
    return { ...updated };
  }

  deleteAddon(tenantId: string, id: string): void {
    const prev = this.addons.length;
    this.addons = this.addons.filter((a) => !(a.id === id && a.tenantId === tenantId));
    if (this.addons.length === prev) throw new ApiError('Add-on not found.', 404);
  }

  // --- Promotions ---
  listPromotions(tenantId: string): Promotion[] {
    return this.promotions.filter((p) => p.tenantId === tenantId).map((p) => ({ ...p }));
  }

  createPromotion(tenantId: string, dto: CreatePromotionDto): Promotion {
    const created: Promotion = { ...dto, id: `promo-${Date.now()}`, tenantId };
    this.promotions = [created, ...this.promotions];
    return { ...created };
  }

  updatePromotion(tenantId: string, id: string, dto: UpdatePromotionDto): Promotion {
    const index = this.promotions.findIndex((p) => p.id === id && p.tenantId === tenantId);
    if (index === -1) throw new ApiError('Promotion not found.', 404);
    const updated = { ...this.promotions[index], ...dto };
    this.promotions = [...this.promotions.slice(0, index), updated, ...this.promotions.slice(index + 1)];
    return { ...updated };
  }

  deletePromotion(tenantId: string, id: string): void {
    const prev = this.promotions.length;
    this.promotions = this.promotions.filter((p) => !(p.id === id && p.tenantId === tenantId));
    if (this.promotions.length === prev) throw new ApiError('Promotion not found.', 404);
  }

  // --- Coupons ---
  listCoupons(tenantId: string): Coupon[] {
    return this.coupons.filter((c) => c.tenantId === tenantId).map((c) => ({ ...c }));
  }

  createCoupon(tenantId: string, dto: CreateCouponDto): Coupon {
    const created: Coupon = { ...dto, id: `cpn-${Date.now()}`, tenantId };
    this.coupons = [created, ...this.coupons];
    return { ...created };
  }

  updateCoupon(tenantId: string, id: string, dto: UpdateCouponDto): Coupon {
    const index = this.coupons.findIndex((c) => c.id === id && c.tenantId === tenantId);
    if (index === -1) throw new ApiError('Coupon not found.', 404);
    const updated = { ...this.coupons[index], ...dto };
    this.coupons = [...this.coupons.slice(0, index), updated, ...this.coupons.slice(index + 1)];
    return { ...updated };
  }

  deleteCoupon(tenantId: string, id: string): void {
    const prev = this.coupons.length;
    this.coupons = this.coupons.filter((c) => !(c.id === id && c.tenantId === tenantId));
    if (this.coupons.length === prev) throw new ApiError('Coupon not found.', 404);
  }

  // --- Store profile ---
  getStoreProfile(tenantId: string): StoreProfile {
    return { ...(this.storeProfiles.get(tenantId) ?? this.defaultStoreProfile(tenantId)) };
  }

  updateStoreProfile(tenantId: string, dto: UpdateStoreProfileDto): StoreProfile {
    const current = this.getStoreProfile(tenantId);
    const updated = { ...current, ...dto, tenantId };
    this.storeProfiles.set(tenantId, updated);
    return { ...updated };
  }

  // --- Tenant settings ---
  getTenantSettings(tenantId: string): TenantSettings {
    return { ...(this.tenantSettings.get(tenantId) ?? this.defaultTenantSettings(tenantId)) };
  }

  updateTenantSettings(tenantId: string, dto: UpdateTenantSettingsDto): TenantSettings {
    const current = this.getTenantSettings(tenantId);
    const updated = { ...current, ...dto, tenantId };
    this.tenantSettings.set(tenantId, updated);
    return { ...updated };
  }

  // --- Loyalty ---
  getLoyaltyProgram(tenantId: string): LoyaltyProgram {
    return structuredClone(this.loyaltyPrograms.get(tenantId) ?? this.defaultLoyaltyProgram(tenantId));
  }

  updateLoyaltyProgram(tenantId: string, dto: UpdateLoyaltyProgramDto): LoyaltyProgram {
    const current = this.getLoyaltyProgram(tenantId);
    const rewards = dto.rewards
      ? dto.rewards.map((r, i) => ({ id: r.id ?? `rw-${Date.now()}-${i}`, name: r.name, points: r.points }))
      : current.rewards;
    const updated: LoyaltyProgram = {
      ...current,
      ...dto,
      tenantId,
      rewards,
    };
    this.loyaltyPrograms.set(tenantId, updated);
    return structuredClone(updated);
  }

  // --- Attendance ---
  listAttendance(tenantId: string): AttendanceRecord[] {
    return this.attendance.filter((a) => a.tenantId === tenantId).map((a) => ({ ...a }));
  }

  clockIn(tenantId: string, employeeId: string): AttendanceRecord {
    const employee = this.listEmployees(tenantId).find((e) => e.id === employeeId);
    if (!employee) throw new ApiError('Employee not found.', 404);
    const open = this.attendance.find(
      (a) => a.tenantId === tenantId && a.employeeId === employeeId && a.clockOut === null,
    );
    if (open) throw new ApiError('Employee is already clocked in.', 409);
    const now = new Date();
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId,
      employeeId,
      employeeName: employee.name,
      clockIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockOut: null,
      hoursWorked: 0,
      date: now.toISOString().slice(0, 10),
    };
    this.attendance = [record, ...this.attendance];
    return { ...record };
  }

  clockOut(tenantId: string, employeeId: string): AttendanceRecord {
    const index = this.attendance.findIndex(
      (a) => a.tenantId === tenantId && a.employeeId === employeeId && a.clockOut === null,
    );
    if (index === -1) throw new ApiError('No active clock-in found.', 404);
    const now = new Date();
    const updated: AttendanceRecord = {
      ...this.attendance[index],
      clockOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hoursWorked: 8,
    };
    this.attendance = [...this.attendance.slice(0, index), updated, ...this.attendance.slice(index + 1)];
    return { ...updated };
  }

  // --- Shifts ---
  listShifts(tenantId: string): Shift[] {
    return this.shifts.filter((s) => s.tenantId === tenantId).map((s) => ({ ...s }));
  }

  createShift(tenantId: string, dto: CreateShiftDto): Shift {
    const created: Shift = { ...dto, id: `sh-${Date.now()}`, tenantId };
    this.shifts = [created, ...this.shifts];
    return { ...created };
  }

  updateShift(tenantId: string, id: string, dto: UpdateShiftDto): Shift {
    const index = this.shifts.findIndex((s) => s.id === id && s.tenantId === tenantId);
    if (index === -1) throw new ApiError('Shift not found.', 404);
    const updated = { ...this.shifts[index], ...dto };
    this.shifts = [...this.shifts.slice(0, index), updated, ...this.shifts.slice(index + 1)];
    return { ...updated };
  }

  deleteShift(tenantId: string, id: string): void {
    const prev = this.shifts.length;
    this.shifts = this.shifts.filter((s) => !(s.id === id && s.tenantId === tenantId));
    if (this.shifts.length === prev) throw new ApiError('Shift not found.', 404);
  }

  // --- Leave requests ---
  listLeaveRequests(tenantId: string): LeaveRequest[] {
    return this.leaveRequests.filter((l) => l.tenantId === tenantId).map((l) => ({ ...l }));
  }

  createLeaveRequest(tenantId: string, employeeId: string, date: string): LeaveRequest {
    const employee = this.listEmployees(tenantId).find((e) => e.id === employeeId);
    if (!employee) throw new ApiError('Employee not found.', 404);
    const created: LeaveRequest = {
      id: `lv-${Date.now()}`,
      tenantId,
      employeeId,
      employeeName: employee.name,
      date,
      status: 'Pending',
    };
    this.leaveRequests = [created, ...this.leaveRequests];
    return { ...created };
  }

  updateLeaveRequest(tenantId: string, id: string, dto: UpdateLeaveRequestDto): LeaveRequest {
    const index = this.leaveRequests.findIndex((l) => l.id === id && l.tenantId === tenantId);
    if (index === -1) throw new ApiError('Leave request not found.', 404);
    const updated = { ...this.leaveRequests[index], status: dto.status };
    this.leaveRequests = [...this.leaveRequests.slice(0, index), updated, ...this.leaveRequests.slice(index + 1)];
    return { ...updated };
  }

  private seed(): void {
    this.tenants = [
      this.buildTenant('t-1', 'Sugarblitz', 'GROWTH', 'ACTIVE', 'hello@sugarblitz.com', '+63 912 345 6789', 18740),
      this.buildTenant('t-2', 'BrewLab', 'PREMIUM', 'ACTIVE', 'owner@brewlab.com', '+63 917 111 2233', 23980),
      this.buildTenant('t-3', 'Coffee Haven', 'STARTER', 'ACTIVE', 'owner@coffeehaven.com', '+63 918 444 5566', 12050),
      this.buildTenant('t-4', 'Bean Street', 'GROWTH', 'INACTIVE', 'owner@beanstreet.com', '+63 919 777 8899', 0),
      this.buildTenant('t-5', 'Roast & Co', 'STARTER', 'PENDING', 'apply@roastco.com', '+63 920 123 4567', 0),
      this.buildTenant('t-6', 'Daily Grind', 'GROWTH', 'PENDING', 'hello@dailygrind.com', '+63 921 987 6543', 0),
    ];
    this.categories = this.generateCategories();
    this.products = this.generateProducts(20);
    this.customers = this.generateCustomers(20);
    this.employees = this.generateEmployees(10);
    this.inventory = this.generateInventory(20);
    this.orders = this.generateOrders(50);
    this.suppliers = this.generateSuppliers(12);
    this.payments = this.generatePayments();
    for (const tenant of this.tenants.filter((t) => t.status === 'ACTIVE')) {
      this.initTenantDefaults(tenant);
    }
  }

  private initTenantDefaults(tenant: Tenant): void {
    const tenantId = tenant.id;
    if (!this.storeProfiles.has(tenantId)) {
      this.storeProfiles.set(tenantId, this.defaultStoreProfile(tenantId, tenant));
    }
    if (!this.tenantSettings.has(tenantId)) {
      this.tenantSettings.set(tenantId, this.defaultTenantSettings(tenantId, tenant));
    }
    if (!this.loyaltyPrograms.has(tenantId)) {
      this.loyaltyPrograms.set(tenantId, this.defaultLoyaltyProgram(tenantId));
    }
    if (this.listShifts(tenantId).length === 0) {
      this.shifts.push(
        { id: `sh-m-${tenantId}`, tenantId, name: 'Morning Shift', startTime: '6:00 AM', endTime: '2:00 PM' },
        { id: `sh-a-${tenantId}`, tenantId, name: 'Afternoon Shift', startTime: '2:00 PM', endTime: '10:00 PM' },
        { id: `sh-n-${tenantId}`, tenantId, name: 'Night Shift', startTime: '10:00 PM', endTime: '6:00 AM' },
      );
    }
    if (this.listVariants(tenantId).length === 0) {
      const productId = this.listProducts(tenantId)[0]?.id ?? `p-1`;
      ['Small', 'Medium', 'Large', 'Extra Large'].forEach((name, i) => {
        this.variants.push({
          id: `var-${tenantId}-${i}`,
          tenantId,
          productId,
          name,
          extraPrice: i * 0.5,
          status: 'ACTIVE',
        });
      });
    }
    if (this.listAddons(tenantId).length === 0) {
      [
        { name: 'Extra Shot', price: 0.8 },
        { name: 'Soy Milk', price: 0.6 },
        { name: 'Oat Milk', price: 0.8 },
      ].forEach((a, i) => {
        this.addons.push({ id: `add-${tenantId}-${i}`, tenantId, ...a, status: 'ACTIVE' });
      });
    }
  }

  private defaultStoreProfile(tenantId: string, tenant?: Tenant): StoreProfile {
    const t = tenant ?? this.getTenant(tenantId);
    return {
      tenantId,
      businessName: t.name,
      logo: '',
      banner: '',
      description: 'Artisan coffee and pastries.',
      phone: t.phone,
      email: t.email,
      address: 'Cebu City',
      businessHours: 'Mon-Sun 7:00 AM - 10:00 PM',
      socialLinks: '',
      primaryColor: '#8b5e3c',
      secondaryColor: '#f7d9aa',
      theme: 'coffee',
      receiptFooter: 'Thank you for choosing BRIVIO Cafe.',
    };
  }

  private defaultTenantSettings(tenantId: string, tenant?: Tenant): TenantSettings {
    const t = tenant ?? this.getTenant(tenantId);
    return {
      tenantId,
      storeName: t.name,
      timezone: 'Asia/Manila',
      twoFactor: false,
      requirePinRefund: true,
      emailAlerts: true,
      lowStockAlerts: true,
      paymentGateway: 'Stripe',
      emailProvider: 'SendGrid',
    };
  }

  private defaultLoyaltyProgram(tenantId: string): LoyaltyProgram {
    return {
      tenantId,
      pointsPerPurchase: 1,
      minimumSpend: 100,
      expiryDays: 365,
      rewards: [
        { id: 'rw-1', name: 'Free Americano', points: 120 },
        { id: 'rw-2', name: 'Any Pastry', points: 180 },
      ],
      redemptions: [
        {
          id: 'rd-1',
          customerId: 'c-1',
          customerName: 'Customer 3',
          reward: 'Free Americano',
          points: 120,
          date: '2026-06-15',
        },
      ],
    };
  }

  private buildTenant(
    id: string,
    name: string,
    plan: SubscriptionPlan,
    status: Tenant['status'],
    email: string,
    phone: string,
    monthlyRevenue: number,
    createdAt?: string,
  ): Tenant {
    return {
      id,
      name,
      plan,
      status,
      email,
      phone,
      createdAt: createdAt ?? new Date(2025, Math.floor(Math.random() * 12), 1).toISOString(),
      monthlyRevenue,
    };
  }

  private generateProducts(total: number): Product[] {
    const names = [
      'Classic Latte', 'Americano', 'Cappuccino', 'Mocha', 'Flat White', 'Espresso',
      'Caramel Macchiato', 'Vanilla Cold Brew', 'Choco Croissant', 'Blueberry Muffin',
    ];
    return Array.from({ length: total }, (_, index) => ({
      id: `p-${index + 1}`,
      tenantId: this.pickTenant(index),
      name: `${names[index % names.length]} ${index + 1}`,
      sku: `SKU-${1000 + index}`,
      categoryId: `cat-1-${(index % 4) + 1}`,
      price: 4 + (index % 8) * 1.5,
      status: index % 9 === 0 ? 'INACTIVE' : 'ACTIVE',
    }));
  }

  private generateCategories(): Category[] {
    const base = ['Coffee', 'Tea', 'Pastries', 'Desserts'];
    const activeTenantIds = this.tenants.filter((t) => t.status === 'ACTIVE').map((t) => t.id);
    return activeTenantIds.flatMap((tenantId, tenantIndex) =>
      base.map((name, categoryIndex) => ({
        id: `cat-${tenantIndex + 1}-${categoryIndex + 1}`,
        tenantId,
        name,
        status: 'ACTIVE' as const,
      })),
    );
  }

  private generateCustomers(total: number): Customer[] {
    return Array.from({ length: total }, (_, index) => ({
      id: `c-${index + 1}`,
      tenantId: this.pickTenant(index),
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@demo.com`,
      phone: `+63 900 100 ${String(index).padStart(4, '0')}`,
      loyaltyPoints: Math.floor(Math.random() * 800),
      status: index % 7 === 0 ? 'INACTIVE' : 'ACTIVE',
    }));
  }

  private generateEmployees(total: number): Employee[] {
    const roles = ['Barista', 'Cashier', 'Supervisor', 'Kitchen Staff'];
    return Array.from({ length: total }, (_, index) => ({
      id: `e-${index + 1}`,
      tenantId: this.pickTenant(index),
      name: `Employee ${index + 1}`,
      role: roles[index % roles.length],
      email: `employee${index + 1}@demo.com`,
      status: index % 8 === 0 ? 'INACTIVE' : 'ACTIVE',
    }));
  }

  private generateInventory(total: number): Inventory[] {
    const units = ['kg', 'ltr', 'pcs', 'pack'];
    return Array.from({ length: total }, (_, index) => ({
      id: `i-${index + 1}`,
      tenantId: this.pickTenant(index),
      productId: `p-${(index % 20) + 1}`,
      productName: `Ingredient ${index + 1}`,
      quantity: 10 + Math.floor(Math.random() * 120),
      reorderLevel: 25,
      unit: units[index % units.length],
      supplierId: `sup-${(index % 12) + 1}`,
      status: 'ACTIVE' as const,
    }));
  }

  private generateOrders(total: number): Order[] {
    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    return Array.from({ length: total }, (_, index) => {
      const itemCount = 1 + (index % 3);
      const items: OrderItem[] = Array.from({ length: itemCount }, (_, itemIndex) => {
        const unitPrice = 4 + (itemIndex + 1) * 2;
        const quantity = 1 + (itemIndex % 2);
        return {
          productId: `p-${(index + itemIndex) % 20 + 1}`,
          productName: `Menu Item ${itemIndex + 1}`,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        };
      });
      return {
        id: `o-${index + 1}`,
        tenantId: this.pickTenant(index),
        customerId: `c-${(index % 20) + 1}`,
        orderNumber: `BR-${10000 + index}`,
        status: statuses[index % statuses.length],
        totalAmount: items.reduce((sum, item) => sum + item.total, 0),
        createdAt: new Date(2026, 5, 1 + (index % 17)).toISOString(),
        items,
      };
    });
  }

  private generateSuppliers(total: number): Supplier[] {
    const names = ['Bean Source Co', 'Roastline Traders', 'Milk & Foam Supply', 'Sweetleaf Essentials'];
    return Array.from({ length: total }, (_, index) => ({
      id: `sup-${index + 1}`,
      tenantId: this.pickTenant(index),
      name: `${names[index % names.length]} ${index + 1}`,
      contactName: `Contact ${index + 1}`,
      email: `supplier${index + 1}@demo.com`,
      phone: `+63 917 ${String(1000000 + index).slice(-7)}`,
      address: `Warehouse ${index + 1}, Metro District`,
      status: index % 7 === 0 ? 'INACTIVE' : 'ACTIVE',
    }));
  }

  private generatePayments(): Payment[] {
    const methods: PaymentMethod[] = ['CASH', 'CARD', 'E_WALLET', 'BANK_TRANSFER'];
    const statuses: Payment['status'][] = ['PAID', 'PAID', 'PAID', 'PENDING', 'FAILED'];
    return this.orders.map((order, index) => ({
      id: `pay-${index + 1}`,
      tenantId: order.tenantId,
      orderId: order.id,
      amount: order.totalAmount,
      method: methods[index % methods.length],
      status: statuses[index % statuses.length],
      createdAt: order.createdAt,
    }));
  }

  private pickTenant(index: number): string {
    const activeTenantIds = this.tenants.filter((t) => t.status === 'ACTIVE').map((t) => t.id);
    return activeTenantIds[index % activeTenantIds.length];
  }
}
