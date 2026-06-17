import { Routes } from '@angular/router';
import { ROLES, TENANT_ROLES } from './core/constants/roles';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminDashboardComponent, AdminTenantsComponent } from './features/admin/admin-pages.component';
import {
  TenantDashboardComponent,
  TenantOrdersComponent,
  TenantProductsComponent,
  TenantStoreComponent,
} from './features/tenant/tenant-pages.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TenantLayoutComponent } from './layouts/tenant-layout/tenant-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.SUPER_ADMIN] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'tenants', component: AdminTenantsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
    ],
  },
  {
    path: 'tenant',
    component: TenantLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: TENANT_ROLES },
    children: [
      { path: 'dashboard', component: TenantDashboardComponent },
      { path: 'products', component: TenantProductsComponent },
      { path: 'orders', component: TenantOrdersComponent },
      { path: 'store', component: TenantStoreComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
