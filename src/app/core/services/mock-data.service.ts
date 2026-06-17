import { Injectable } from '@angular/core';
import {
  Category,
  Customer,
  Employee,
  Inventory,
  Order,
  OrderStatus,
  OrderItem,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Product,
  Supplier,
  Tenant,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private tenants: Tenant[] = [
    this.buildTenant('t-1', 'Sugarblitz', 'GROWTH', 'ACTIVE', 'hello@sugarblitz.com', '+63 912 345 6789', 18740),
    this.buildTenant('t-2', 'BrewLab', 'PREMIUM', 'ACTIVE', 'owner@brewlab.com', '+63 917 111 2233', 23980),
    this.buildTenant('t-3', 'Coffee Haven', 'STARTER', 'ACTIVE', 'owner@coffeehaven.com', '+63 918 444 5566', 12050),
    this.buildTenant('t-4', 'Bean Street', 'GROWTH', 'INACTIVE', 'owner@beanstreet.com', '+63 919 777 8899', 0),
    this.buildTenant('t-5', 'Roast & Co', 'STARTER', 'PENDING', 'apply@roastco.com', '+63 920 123 4567', 0),
    this.buildTenant('t-6', 'Daily Grind', 'GROWTH', 'PENDING', 'hello@dailygrind.com', '+63 921 987 6543', 0),
  ];

  private categories = this.generateCategories();
  private products = this.generateProducts(20);
  private customers = this.generateCustomers(20);
  private employees = this.generateEmployees(10);
  private inventory = this.generateInventory(20);
  private orders = this.generateOrders(50);
  private suppliers = this.generateSuppliers(12);
  private payments = this.generatePayments();

  getTenants(): Tenant[] {
    return [...this.tenants].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((tenant) => tenant.id === id);
  }

  getTenantByEmail(email: string): Tenant | undefined {
    const normalized = email.trim().toLowerCase();
    return this.tenants.find((tenant) => tenant.email.toLowerCase() === normalized);
  }

  createTenantApplication(input: {
    name: string;
    email: string;
    phone: string;
    plan: Tenant['plan'];
  }): Tenant {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (this.getTenantByEmail(normalizedEmail)) {
      throw new Error('An application or account with this email already exists.');
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
    return { ...created };
  }

  updateTenantStatus(id: string, status: Tenant['status']): Tenant | null {
    const index = this.tenants.findIndex((tenant) => tenant.id === id);
    if (index === -1) {
      return null;
    }
    const updated = { ...this.tenants[index], status };
    this.tenants = [...this.tenants.slice(0, index), updated, ...this.tenants.slice(index + 1)];
    return { ...updated };
  }

  getProductsByTenant(tenantId: string): Product[] {
    return this.products.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item }));
  }

  getCategoriesByTenant(tenantId: string): Category[] {
    return this.categories.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item }));
  }

  getCustomersByTenant(tenantId: string): Customer[] {
    return this.customers.filter((item) => item.tenantId === tenantId);
  }

  getEmployeesByTenant(tenantId: string): Employee[] {
    return this.employees.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item }));
  }

  getInventoryByTenant(tenantId: string): Inventory[] {
    return this.inventory.filter((item) => item.tenantId === tenantId);
  }

  getOrdersByTenant(tenantId: string): Order[] {
    return this.orders.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item, items: [...item.items] }));
  }

  getSuppliersByTenant(tenantId: string): Supplier[] {
    return this.suppliers.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item }));
  }

  getPaymentsByTenant(tenantId: string): Payment[] {
    return this.payments.filter((item) => item.tenantId === tenantId).map((item) => ({ ...item }));
  }

  updateInventoryQuantity(id: string, tenantId: string, quantity: number): Inventory | null {
    const index = this.inventory.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }
    const safeQuantity = Math.max(0, Number.isFinite(quantity) ? quantity : 0);
    const current = this.inventory[index];
    const updated: Inventory = {
      ...current,
      quantity: safeQuantity,
      status: safeQuantity <= current.reorderLevel ? 'PENDING' : 'ACTIVE',
    };
    this.inventory = [...this.inventory.slice(0, index), updated, ...this.inventory.slice(index + 1)];
    return { ...updated };
  }

  createSupplier(input: Omit<Supplier, 'id'>): Supplier {
    const created: Supplier = { ...input, id: `sup-${Date.now()}` };
    this.suppliers = [created, ...this.suppliers];
    return { ...created };
  }

  updateSupplier(id: string, tenantId: string, updates: Partial<Omit<Supplier, 'id' | 'tenantId'>>): Supplier | null {
    const index = this.suppliers.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }
    const updated = { ...this.suppliers[index], ...updates };
    this.suppliers = [...this.suppliers.slice(0, index), updated, ...this.suppliers.slice(index + 1)];
    return { ...updated };
  }

  deleteSupplier(id: string, tenantId: string): boolean {
    const previous = this.suppliers.length;
    this.suppliers = this.suppliers.filter((item) => !(item.id === id && item.tenantId === tenantId));
    return this.suppliers.length < previous;
  }

  createEmployee(input: Omit<Employee, 'id'>): Employee {
    const created: Employee = { ...input, id: `e-${Date.now()}` };
    this.employees = [created, ...this.employees];
    return { ...created };
  }

  updateEmployee(id: string, tenantId: string, updates: Partial<Omit<Employee, 'id' | 'tenantId'>>): Employee | null {
    const index = this.employees.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }
    const updated = { ...this.employees[index], ...updates };
    this.employees = [...this.employees.slice(0, index), updated, ...this.employees.slice(index + 1)];
    return { ...updated };
  }

  deleteEmployee(id: string, tenantId: string): boolean {
    const previous = this.employees.length;
    this.employees = this.employees.filter((item) => !(item.id === id && item.tenantId === tenantId));
    return this.employees.length < previous;
  }

  suspendEmployee(id: string, tenantId: string): Employee | null {
    return this.updateEmployee(id, tenantId, { status: 'INACTIVE' });
  }

  createProduct(input: Omit<Product, 'id'>): Product {
    const created: Product = { ...input, id: `p-${Date.now()}` };
    this.products = [created, ...this.products];
    return { ...created };
  }

  updateProduct(id: string, tenantId: string, updates: Partial<Omit<Product, 'id' | 'tenantId'>>): Product | null {
    const index = this.products.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }

    const updated = { ...this.products[index], ...updates };
    this.products = [...this.products.slice(0, index), updated, ...this.products.slice(index + 1)];
    return { ...updated };
  }

  deleteProduct(id: string, tenantId: string): boolean {
    const existingLength = this.products.length;
    this.products = this.products.filter((item) => !(item.id === id && item.tenantId === tenantId));
    return this.products.length < existingLength;
  }

  createCategory(input: Omit<Category, 'id'>): Category {
    const created: Category = { ...input, id: `cat-${Date.now()}` };
    this.categories = [created, ...this.categories];
    return { ...created };
  }

  updateCategory(id: string, tenantId: string, updates: Partial<Omit<Category, 'id' | 'tenantId'>>): Category | null {
    const index = this.categories.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }

    const updated = { ...this.categories[index], ...updates };
    this.categories = [...this.categories.slice(0, index), updated, ...this.categories.slice(index + 1)];
    return { ...updated };
  }

  deleteCategory(id: string, tenantId: string): boolean {
    const existingLength = this.categories.length;
    this.categories = this.categories.filter((item) => !(item.id === id && item.tenantId === tenantId));
    return this.categories.length < existingLength;
  }

  updateOrderStatus(id: string, tenantId: string, status: OrderStatus): Order | null {
    const index = this.orders.findIndex((item) => item.id === id && item.tenantId === tenantId);
    if (index === -1) {
      return null;
    }

    const updated = { ...this.orders[index], status };
    this.orders = [...this.orders.slice(0, index), updated, ...this.orders.slice(index + 1)];
    return { ...updated, items: [...updated.items] };
  }

  getAdminDashboardStats() {
    const activeTenants = this.tenants.filter((t) => t.status === 'ACTIVE').length;
    const pendingApplications = this.tenants.filter((t) => t.status === 'PENDING').length;
    const inactiveTenants = this.tenants.filter((t) => t.status === 'INACTIVE').length;

    return {
      totalTenants: this.tenants.length,
      activeTenants,
      pendingApplications,
      inactiveTenants,
    };
  }

  getTenantDashboardStats(tenantId: string) {
    const tenantOrders = this.getOrdersByTenant(tenantId);
    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = tenantOrders.filter((order) => order.createdAt.startsWith(today));
    const pendingOrders = tenantOrders.filter((order) => order.status === 'PENDING').length;
    const lowStockAlerts = this.getInventoryByTenant(tenantId).filter(
      (item) => item.quantity <= item.reorderLevel,
    ).length;
    const monthlyRevenue = tenantOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      todaysSales: todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      todaysOrders: todaysOrders.length,
      monthlyRevenue,
      activeCustomers: this.getCustomersByTenant(tenantId).filter((c) => c.status === 'ACTIVE').length,
      lowStockAlerts,
      pendingOrders,
    };
  }

  private buildTenant(
    id: string,
    name: string,
    plan: Tenant['plan'],
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
    return Array.from({ length: total }, (_, index) => {
      const tenantId = this.pickTenant(index);
      return {
        id: `p-${index + 1}`,
        tenantId,
        name: `${names[index % names.length]} ${index + 1}`,
        sku: `SKU-${1000 + index}`,
        categoryId: `cat-${(index % 5) + 1}`,
        price: 4 + (index % 8) * 1.5,
        status: index % 9 === 0 ? 'INACTIVE' : 'ACTIVE',
      };
    });
  }

  private generateCategories(): Category[] {
    const base = ['Coffee', 'Tea', 'Pastries', 'Desserts'];
    const activeTenantIds = this.tenants.filter((tenant) => tenant.status === 'ACTIVE').map((tenant) => tenant.id);
    return activeTenantIds.flatMap((tenantId, tenantIndex) =>
      base.map((name, categoryIndex) => ({
        id: `cat-${tenantIndex + 1}-${categoryIndex + 1}`,
        tenantId,
        name,
        status: 'ACTIVE',
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
      status: 'ACTIVE',
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
          productId: `p-${(index + itemIndex) % 20}`,
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
    const statuses: PaymentStatus[] = ['PAID', 'PAID', 'PAID', 'PENDING', 'FAILED'];
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
    const activeTenantIds = this.tenants.filter((tenant) => tenant.status === 'ACTIVE').map((t) => t.id);
    return activeTenantIds[index % activeTenantIds.length];
  }
}
