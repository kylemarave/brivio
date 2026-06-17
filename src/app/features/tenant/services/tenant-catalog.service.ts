import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Category, Product, Variant } from '../../../core/models';
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateVariantDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateVariantDto,
} from '../../../core/models/dtos';
import { Addon } from '../../../core/models';
import { CreateAddonDto, UpdateAddonDto } from '../../../core/models/dtos';
import { AddonRepository } from '../../../core/repositories/addon.repository';
import { CategoryRepository } from '../../../core/repositories/category.repository';
import { ProductRepository } from '../../../core/repositories/product.repository';
import { VariantRepository } from '../../../core/repositories/variant.repository';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantCatalogService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly variantRepository: VariantRepository,
    private readonly addonRepository: AddonRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listProducts(): Observable<Product[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.productRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.productRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateProduct(id: string, dto: UpdateProductDto): Observable<Product> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.productRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteProduct(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.productRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listCategories(): Observable<Category[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.categoryRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createCategory(dto: CreateCategoryDto): Observable<Category> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.categoryRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Observable<Category> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.categoryRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteCategory(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.categoryRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listVariants(): Observable<Variant[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.variantRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createVariant(dto: CreateVariantDto): Observable<Variant> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.variantRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateVariant(id: string, dto: UpdateVariantDto): Observable<Variant> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.variantRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteVariant(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.variantRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  listAddons(): Observable<Addon[]> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.addonRepository.list(tenantId).pipe(map((r) => r.data));
  }

  createAddon(dto: CreateAddonDto): Observable<Addon> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.addonRepository.create(tenantId, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  updateAddon(id: string, dto: UpdateAddonDto): Observable<Addon> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.addonRepository.update(tenantId, id, dto).pipe(
      map((r) => r.data),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }

  deleteAddon(id: string): Observable<void> {
    const tenantId = this.tenantContext.requireTenantId();
    return this.addonRepository.delete(tenantId, id).pipe(
      map(() => undefined),
      tap(() => this.tenantContext.bumpRefresh()),
    );
  }
}
