import { EntityStatus, OrderStatus, PaymentMethod, PaymentStatus } from '../models';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TenantQueryParams extends PaginationParams {
  status?: EntityStatus | 'ALL';
}

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  status?: EntityStatus | 'ALL';
}

export interface OrderQueryParams extends PaginationParams {
  search?: string;
  status?: OrderStatus | 'ALL';
  paymentMethod?: PaymentMethod | 'ALL';
}

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
  status?: EntityStatus | 'ALL';
}

export interface PaymentQueryParams extends PaginationParams {
  method?: PaymentMethod | 'ALL';
  status?: PaymentStatus | 'ALL';
}
