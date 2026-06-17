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
