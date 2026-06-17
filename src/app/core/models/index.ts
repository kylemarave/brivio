import { Role } from '../constants/roles';

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'E_WALLET' | 'BANK_TRANSFER';
export type SubscriptionPlan = 'STARTER' | 'GROWTH' | 'PREMIUM' | 'ENTERPRISE';

export interface Tenant {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  status: EntityStatus;
  email: string;
  phone: string;
  createdAt: string;
  monthlyRevenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string;
  status: EntityStatus;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  status: EntityStatus;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  status: EntityStatus;
}

export interface Variant {
  id: string;
  tenantId: string;
  productId: string;
  name: string;
  extraPrice: number;
  status: EntityStatus;
}

export interface Addon {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  status: EntityStatus;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  status: EntityStatus;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  email: string;
  status: EntityStatus;
}

export interface Inventory {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  supplierId: string;
  status: EntityStatus;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  status: EntityStatus;
}

export interface Payment {
  id: string;
  tenantId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  discountPercentage: number;
  startsAt: string;
  endsAt: string;
  status: EntityStatus;
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  discountPercentage: number;
  usageLimit: number;
  status: EntityStatus;
}

export interface Settings {
  id: string;
  tenantId: string;
  currency: string;
  timezone: string;
  taxRate: number;
  enableDarkMode: boolean;
}

export interface StoreProfile {
  tenantId: string;
  businessName: string;
  logo: string;
  banner: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  socialLinks: string;
  primaryColor: string;
  secondaryColor: string;
  theme: string;
  receiptFooter: string;
}

export interface TenantSettings {
  tenantId: string;
  storeName: string;
  timezone: string;
  twoFactor: boolean;
  requirePinRefund: boolean;
  emailAlerts: boolean;
  lowStockAlerts: boolean;
  paymentGateway: string;
  emailProvider: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  points: number;
}

export interface LoyaltyRedemption {
  id: string;
  customerId: string;
  customerName: string;
  reward: string;
  points: number;
  date: string;
}

export interface LoyaltyProgram {
  tenantId: string;
  pointsPerPurchase: number;
  minimumSpend: number;
  expiryDays: number;
  rewards: LoyaltyReward[];
  redemptions: LoyaltyRedemption[];
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut: string | null;
  hoursWorked: number;
  date: string;
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AdminDashboardStats {
  totalTenants: number;
  activeTenants: number;
  pendingApplications: number;
  inactiveTenants: number;
}

export interface AdminTenantWorkspaceStats {
  productCount: number;
  orderCount: number;
  customerCount: number;
  employeeCount: number;
  supplierCount: number;
  pendingOrders: number;
  lowStockAlerts: number;
  monthlyRevenue: number;
  todaysOrders: number;
}

export interface AdminTenantOverview {
  tenant: Tenant;
  storeProfile: StoreProfile;
  settings: TenantSettings;
  workspace: AdminTenantWorkspaceStats;
  recentOrders: Order[];
}

export interface TenantDashboardStats {
  todaysSales: number;
  todaysOrders: number;
  monthlyRevenue: number;
  activeCustomers: number;
  lowStockAlerts: number;
  pendingOrders: number;
}

export interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  customerCount: number;
  employeeCount: number;
  topProducts: { name: string; quantity: number }[];
  recentSales: { label: string; amount: number }[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
