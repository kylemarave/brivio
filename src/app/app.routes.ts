import { Routes } from '@angular/router';
import { ROLES, TENANT_ROLES } from './core/constants/roles';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TenantLayoutComponent } from './layouts/tenant-layout/tenant-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: [ROLES.SUPER_ADMIN] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-pages.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./features/admin/admin-pages.component').then((m) => m.AdminTenantsComponent),
      },
      {
        path: 'tenants/:id',
        loadComponent: () =>
          import('./features/admin/pages/admin-tenant-detail.component').then((m) => m.AdminTenantDetailComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
    ],
  },
  {
    path: 'tenant',
    component: TenantLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: TENANT_ROLES },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/tenant/pages/tenant-dashboard.component').then((m) => m.TenantDashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/tenant/pages/tenant-products.component').then((m) => m.TenantProductsComponent) },
      { path: 'categories', loadComponent: () => import('./features/tenant/pages/tenant-categories.component').then((m) => m.TenantCategoriesComponent) },
      { path: 'variants', loadComponent: () => import('./features/tenant/pages/tenant-variants.component').then((m) => m.TenantVariantsComponent) },
      { path: 'addons', loadComponent: () => import('./features/tenant/pages/tenant-addons.component').then((m) => m.TenantAddonsComponent) },
      { path: 'orders', loadComponent: () => import('./features/tenant/pages/tenant-orders.component').then((m) => m.TenantOrdersComponent) },
      { path: 'customers', loadComponent: () => import('./features/tenant/pages/tenant-customers.component').then((m) => m.TenantCustomersComponent) },
      { path: 'loyalty', loadComponent: () => import('./features/tenant/pages/tenant-loyalty.component').then((m) => m.TenantLoyaltyComponent) },
      { path: 'inventory', loadComponent: () => import('./features/tenant/pages/tenant-inventory.component').then((m) => m.TenantInventoryComponent) },
      { path: 'suppliers', loadComponent: () => import('./features/tenant/pages/tenant-suppliers.component').then((m) => m.TenantSuppliersComponent) },
      { path: 'employees', loadComponent: () => import('./features/tenant/pages/tenant-employees.component').then((m) => m.TenantEmployeesComponent) },
      { path: 'attendance', loadComponent: () => import('./features/tenant/pages/tenant-attendance.component').then((m) => m.TenantAttendanceComponent) },
      { path: 'schedule', loadComponent: () => import('./features/tenant/pages/tenant-schedule.component').then((m) => m.TenantScheduleComponent) },
      { path: 'payments', loadComponent: () => import('./features/tenant/pages/tenant-payments.component').then((m) => m.TenantPaymentsComponent) },
      { path: 'promotions', loadComponent: () => import('./features/tenant/pages/tenant-promotions.component').then((m) => m.TenantPromotionsComponent) },
      { path: 'coupons', loadComponent: () => import('./features/tenant/pages/tenant-coupons.component').then((m) => m.TenantCouponsComponent) },
      { path: 'reports', loadComponent: () => import('./features/tenant/pages/tenant-reports.component').then((m) => m.TenantReportsComponent) },
      { path: 'store', loadComponent: () => import('./features/tenant/pages/tenant-store.component').then((m) => m.TenantStoreComponent) },
      { path: 'settings', loadComponent: () => import('./features/tenant/pages/tenant-settings.component').then((m) => m.TenantSettingsComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
