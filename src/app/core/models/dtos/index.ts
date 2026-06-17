import {
  EntityStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SubscriptionPlan,
} from '..';

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  status: EntityStatus;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  categoryId?: string;
  price?: number;
  status?: EntityStatus;
}

export interface CreateCategoryDto {
  name: string;
  status: EntityStatus;
}

export interface UpdateCategoryDto {
  name?: string;
  status?: EntityStatus;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  status: EntityStatus;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
  status?: EntityStatus;
}

export interface CreateOrderDto {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreateSupplierDto {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  status: EntityStatus;
}

export interface UpdateSupplierDto {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: EntityStatus;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  role: string;
  status: EntityStatus;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  role?: string;
  status?: EntityStatus;
}

export interface UpdateInventoryDto {
  quantity: number;
}

export interface CreateVariantDto {
  productId: string;
  name: string;
  extraPrice: number;
  status: EntityStatus;
}

export interface UpdateVariantDto {
  productId?: string;
  name?: string;
  extraPrice?: number;
  status?: EntityStatus;
}

export interface CreateAddonDto {
  name: string;
  price: number;
  status: EntityStatus;
}

export interface UpdateAddonDto {
  name?: string;
  price?: number;
  status?: EntityStatus;
}

export interface CreatePromotionDto {
  name: string;
  discountPercentage: number;
  startsAt: string;
  endsAt: string;
  status: EntityStatus;
}

export interface UpdatePromotionDto {
  name?: string;
  discountPercentage?: number;
  startsAt?: string;
  endsAt?: string;
  status?: EntityStatus;
}

export interface CreateCouponDto {
  code: string;
  discountPercentage: number;
  usageLimit: number;
  status: EntityStatus;
}

export interface UpdateCouponDto {
  code?: string;
  discountPercentage?: number;
  usageLimit?: number;
  status?: EntityStatus;
}

export interface UpdateStoreProfileDto {
  businessName?: string;
  logo?: string;
  banner?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  socialLinks?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: string;
  receiptFooter?: string;
}

export interface UpdateTenantSettingsDto {
  storeName?: string;
  timezone?: string;
  twoFactor?: boolean;
  requirePinRefund?: boolean;
  emailAlerts?: boolean;
  lowStockAlerts?: boolean;
  paymentGateway?: string;
  emailProvider?: string;
}

export interface UpdateLoyaltyProgramDto {
  pointsPerPurchase?: number;
  minimumSpend?: number;
  expiryDays?: number;
  rewards?: { id?: string; name: string; points: number }[];
}

export interface ClockAttendanceDto {
  employeeId: string;
}

export interface CreateShiftDto {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateShiftDto {
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  date: string;
}

export interface UpdateLeaveRequestDto {
  status: 'Approved' | 'Rejected';
}

export interface UpdateTenantDto {
  status?: EntityStatus;
  plan?: SubscriptionPlan;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface RegisterTenantDto {
  name: string;
  email: string;
  phone: string;
  plan: SubscriptionPlan;
}
