# Product Requirements Document (PRD)

## Brivio — Multi-Tenant Coffee Shop SaaS Platform

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | June 18, 2026 |
| **Status** | Implemented (frontend prototype with mock API) |

---

## 1. Executive Summary

**Brivio** is a multi-tenant SaaS platform designed for coffee shops and retail businesses. It provides platform operators with a centralized console to onboard and manage tenants, while giving approved store owners an isolated workspace to run catalog, sales, operations, people, finance, and marketing functions.

The current implementation is an **Angular 21** single-page application with a **repository-based architecture** backed by **in-memory mock APIs**. It is architected so mock repositories can be swapped for HTTP implementations without changing UI or feature services.

**Primary value proposition:** One platform to onboard retail brands, approve them through a controlled workflow, and give each approved business a full back-office console — without data leaking across tenants.

---

## 2. Problem Statement

Independent coffee shops and small retail chains often lack integrated tooling for:

- Catalog management (products, variants, add-ons)
- Order lifecycle tracking
- Inventory and supplier coordination
- Staff scheduling and attendance
- Loyalty and promotions
- Financial reporting

Platform operators who serve many stores need centralized tenant onboarding, subscription management, and visibility into each workspace's health.

**Brivio addresses both sides:** super-admin platform control and per-tenant operational management.

---

## 3. Goals & Success Criteria

### Product Goals

| Goal | Description |
|------|-------------|
| **G1** | Enable self-service tenant applications with admin approval gating |
| **G2** | Provide tenant-isolated CRUD for all core store operations |
| **G3** | Give admins platform-wide visibility into tenant health and revenue |
| **G4** | Support a clean path from prototype → production API |

### Success Metrics (when productionized)

- Time from application submission to approval
- Number of active tenants per plan tier
- Tenant workspace adoption (modules used per tenant)
- Order throughput and revenue tracked per tenant
- Low-stock alert resolution time

---

## 4. Target Users & Personas

### Persona 1: Super Admin (Platform Operator)

- **Role:** `SUPER_ADMIN`
- **Needs:** Review applications, approve/reject/deactivate tenants, assign subscription plans, monitor platform KPIs
- **Demo account:** `admin@brivio.com`

### Persona 2: Tenant Owner (Store Operator)

- **Role:** `TENANT_OWNER`
- **Needs:** Manage day-to-day store operations after approval
- **Demo account:** `hello@sugarblitz.com` (Sugarblitz, Growth plan)
- **Constraint:** Cannot sign in while application is `PENDING` or `INACTIVE`

### Persona 3: Prospective Tenant (Applicant)

- **Needs:** Submit business details and chosen plan; wait for approval
- **Entry point:** `/register`

---

## 5. User Roles & Access Control

| Role | Access | Route Prefix |
|------|--------|--------------|
| `SUPER_ADMIN` | Platform dashboard, tenant list, tenant detail, plan management | `/admin/*` |
| `TENANT_OWNER` | Full tenant workspace (18 modules) | `/tenant/*` |
| Unauthenticated | Login, register, forgot password | `/login`, `/register`, `/forgot-password` |

### Authorization Model

- `authGuard` — requires authenticated session
- `roleGuard` — enforces role per route; redirects unauthorized users to role-appropriate home
- **Tenant isolation** — all tenant data operations require `tenantId` from the authenticated user via `TenantContextService`

### Login Rules (mock)

- Super admin: any email containing `"admin"`
- Tenant owner: email must match a registered tenant
- `PENDING` tenants: blocked with "application still pending"
- `INACTIVE` tenants: blocked with "account not active"
- Any non-empty password accepted in mock mode

---

## 6. Product Scope

### In Scope (Built)

```
Auth
├── Login
├── Tenant Application (Register)
└── Forgot Password

Super Admin Console
├── Platform Overview
├── Tenant Applications
└── Tenant Detail & Plan Management

Tenant Workspace
├── Dashboard
├── Catalog (Products, Categories, Variants, Add-ons)
├── Sales (Orders, Customers, Loyalty)
├── Operations (Inventory, Suppliers)
├── People (Employees, Attendance, Schedule)
├── Finance (Payments, Reports)
├── Marketing (Promotions, Coupons)
└── Configuration (Store Profile, Settings)
```

### Out of Scope (Current Build)

- Real backend / database / REST API
- Customer-facing POS or online ordering storefront
- Payment gateway integration (settings fields only)
- Email delivery (mock forgot-password)
- Multi-user roles within a tenant (only `TENANT_OWNER`)
- Real 2FA enforcement
- File upload for logos/banners (URL strings only)
- Billing/subscription payment processing

---

## 7. Functional Requirements

### 7.1 Authentication & Onboarding

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users can sign in with email and password | P0 |
| AUTH-02 | System redirects by role after login (admin → tenants, owner → dashboard) | P0 |
| AUTH-03 | Session persists in `sessionStorage` (mock) | P1 |
| AUTH-04 | Prospective tenants submit application with business name, email, phone, plan | P0 |
| AUTH-05 | Duplicate email applications are rejected (409) | P1 |
| AUTH-06 | New applications start in `PENDING` status | P0 |
| AUTH-07 | Forgot-password flow returns confirmation message (mock) | P2 |
| AUTH-08 | Users can sign out and return to login | P0 |

**Tenant application fields:**

- Business name
- Contact email
- Phone
- Subscription plan: `STARTER` | `GROWTH` | `PREMIUM`

---

### 7.2 Super Admin — Platform Overview (`/admin/dashboard`)

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | Display KPIs: pending applications, active tenants, inactive tenants, total records | P0 |
| ADM-02 | Show 5 most recent tenant applications in a table | P1 |
| ADM-03 | Link to full tenant list and individual tenant detail | P1 |

---

### 7.3 Super Admin — Tenant Management (`/admin/tenants`)

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-10 | List all tenant applications with business, email, phone, plan, status, applied date | P0 |
| ADM-11 | Filter tenants by status: All, Pending, Active, Inactive | P1 |
| ADM-12 | Approve pending tenants → `ACTIVE` | P0 |
| ADM-13 | Reject pending tenants → `INACTIVE` | P0 |
| ADM-14 | Deactivate active tenants → `INACTIVE` | P0 |
| ADM-15 | Reactivate inactive tenants → `ACTIVE` | P1 |

---

### 7.4 Super Admin — Tenant Detail (`/admin/tenants/:id`)

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-20 | Show tenant profile hero with status badge and plan | P0 |
| ADM-21 | Display workspace KPIs: monthly revenue, products, orders, customers, employees, suppliers | P0 |
| ADM-22 | Show business & contact details from tenant + store profile | P1 |
| ADM-23 | Allow subscription plan update: Starter ($29), Growth ($79), Premium ($149), Enterprise (custom) | P0 |
| ADM-24 | Display store branding preview (colors, theme, receipt footer) | P2 |
| ADM-25 | Show health alerts: low stock count, pending orders | P1 |
| ADM-26 | List recent orders for the tenant workspace | P1 |
| ADM-27 | Approve / reject / deactivate / reactivate from detail page | P0 |

---

### 7.5 Tenant — Dashboard (`/tenant/dashboard`)

| ID | Requirement | Priority |
|----|-------------|----------|
| TEN-01 | KPI cards: today's sales, today's orders, monthly revenue, active customers, low stock alerts, pending orders | P0 |
| TEN-02 | Sales charts: this week, this month, revenue trend | P1 |
| TEN-03 | Recent orders table (last 8) with link to orders module | P1 |
| TEN-04 | Inventory alerts for items at or below reorder level | P1 |

---

### 7.6 Tenant — Catalog

#### Products (`/tenant/products`)

| ID | Requirement |
|----|-------------|
| CAT-01 | List products with search (name/SKU), status filter, pagination |
| CAT-02 | Create product: name, SKU, category, price, status |
| CAT-03 | Edit and delete products |

#### Categories (`/tenant/categories`)

| ID | Requirement |
|----|-------------|
| CAT-10 | Full CRUD for categories (name, status) |

#### Variants (`/tenant/variants`)

| ID | Requirement |
|----|-------------|
| CAT-20 | Full CRUD for product variants (product link, name, extra price, status) |

#### Add-ons (`/tenant/addons`)

| ID | Requirement |
|----|-------------|
| CAT-30 | Full CRUD for add-ons (name, price, status) |

---

### 7.7 Tenant — Sales

#### Orders (`/tenant/orders`)

| ID | Requirement |
|----|-------------|
| SAL-01 | List orders with search, status filter, payment method filter |
| SAL-02 | Order statuses: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `COMPLETED` / `CANCELLED` |
| SAL-03 | Create orders with customer, line items, payment method |
| SAL-04 | Update order status; view order detail modal |
| SAL-05 | Payment methods: `CASH`, `CARD`, `E_WALLET`, `BANK_TRANSFER` |

#### Customers (`/tenant/customers`)

| ID | Requirement |
|----|-------------|
| SAL-10 | Full CRUD; track loyalty points and contact info |

#### Loyalty (`/tenant/loyalty`)

| ID | Requirement |
|----|-------------|
| SAL-20 | Configure points per purchase, minimum spend, expiry days |
| SAL-21 | View predefined rewards catalog |
| SAL-22 | View redemption history |

---

### 7.8 Tenant — Operations

#### Inventory (`/tenant/inventory`)

| ID | Requirement |
|----|-------------|
| OPS-01 | List inventory with product name, quantity, reorder level, unit, supplier |
| OPS-02 | Update stock quantities |
| OPS-03 | Low-stock detection when `quantity <= reorderLevel` |

#### Suppliers (`/tenant/suppliers`)

| ID | Requirement |
|----|-------------|
| OPS-10 | Full CRUD: name, contact, phone, email, address, status |

---

### 7.9 Tenant — People

#### Employees (`/tenant/employees`)

| ID | Requirement |
|----|-------------|
| PPL-01 | Full CRUD: name, email, role, status |

#### Attendance (`/tenant/attendance`)

| ID | Requirement |
|----|-------------|
| PPL-10 | Clock in / clock out by employee |
| PPL-11 | Attendance history with hours worked |

#### Schedule (`/tenant/schedule`)

| ID | Requirement |
|----|-------------|
| PPL-20 | Manage shift templates (name, start/end time) |
| PPL-21 | Manage leave requests (approve/reject) |

---

### 7.10 Tenant — Finance

#### Payments (`/tenant/payments`)

| ID | Requirement |
|----|-------------|
| FIN-01 | List payments linked to orders |
| FIN-02 | Payment statuses: `PENDING`, `PAID`, `FAILED`, `REFUNDED` |

#### Reports (`/tenant/reports`)

| ID | Requirement |
|----|-------------|
| FIN-10 | Summary stats: total orders, revenue, low stock, customers, employees |
| FIN-11 | Top selling products |
| FIN-12 | Order status distribution |

---

### 7.11 Tenant — Marketing

#### Promotions (`/tenant/promotions`)

| ID | Requirement |
|----|-------------|
| MKT-01 | Full CRUD: name, discount %, start/end dates, status |

#### Coupons (`/tenant/coupons`)

| ID | Requirement |
|----|-------------|
| MKT-10 | Full CRUD: code, discount %, usage limit, status |

---

### 7.12 Tenant — Configuration

#### Store Profile (`/tenant/store`)

| ID | Requirement |
|----|-------------|
| CFG-01 | Edit business profile: name, logo/banner URLs, description, contact, address, hours, social links |
| CFG-02 | Branding: primary/secondary colors, theme, receipt footer |

#### Settings (`/tenant/settings`)

| ID | Requirement |
|----|-------------|
| CFG-10 | General: store name, timezone |
| CFG-11 | Security toggles: 2FA, PIN for refunds |
| CFG-12 | Notifications: email alerts, low stock alerts |
| CFG-13 | Integration placeholders: payment gateway, email provider |

---

## 8. Key User Flows

### Flow A: Tenant Onboarding

```
Applicant → /register → Submit application (PENDING)
    → Super Admin reviews at /admin/tenants
    → Approve → status ACTIVE
    → Owner signs in → /tenant/dashboard
```

### Flow B: Order Fulfillment

```
Owner → /tenant/orders → Create order (PENDING)
    → Update status through lifecycle
    → Payment record associated
    → Reflected in dashboard KPIs and reports
```

### Flow C: Admin Tenant Oversight

```
Super Admin → /admin/tenants/:id
    → Review workspace stats & recent orders
    → Adjust subscription plan
    → Deactivate if needed
```

---

## 9. Subscription Plans

| Plan | Price (UI) | Notes |
|------|------------|-------|
| `STARTER` | $29/mo | Entry tier |
| `GROWTH` | $79/mo | Mid tier (demo tenant Sugarblitz) |
| `PREMIUM` | $149/mo | Advanced tier |
| `ENTERPRISE` | Custom | Admin-only option on tenant detail |

Plans are selectable at registration and updatable by super admin. **No billing integration exists yet.**

---

## 10. Data Model Summary

Core entities (all tenant-scoped except `Tenant` and `User`):

| Domain | Entities |
|--------|----------|
| Platform | `Tenant`, `User`, `AdminDashboardStats` |
| Catalog | `Product`, `Category`, `Variant`, `Addon` |
| Sales | `Order`, `OrderItem`, `Customer`, `LoyaltyProgram` |
| Operations | `Inventory`, `Supplier` |
| People | `Employee`, `AttendanceRecord`, `Shift`, `LeaveRequest` |
| Finance | `Payment`, `ReportSummary` |
| Marketing | `Promotion`, `Coupon` |
| Config | `StoreProfile`, `TenantSettings` |

**Tenant status lifecycle:** `PENDING` → `ACTIVE` | `INACTIVE`

**Entity status:** `ACTIVE` | `INACTIVE` | `PENDING` | `ARCHIVED`

---

## 11. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Architecture** | Layered: Component → Feature Service → Repository → Data source |
| **Framework** | Angular 21, standalone components, signals, lazy-loaded routes |
| **Styling** | Tailwind CSS 4 + DaisyUI; responsive drawer sidebar layout |
| **SSR** | Angular SSR configured (`serve:ssr:brivio`) |
| **API abstraction** | Repository interfaces with swappable mock/HTTP implementations |
| **Tenant isolation** | Every tenant API call scoped by `tenantId`; cross-tenant access returns 404 |
| **State refresh** | `TenantContextService.bumpRefresh()` propagates data changes across views |
| **Mock latency** | Simulated API delay for realistic UX |
| **Session** | Browser `sessionStorage` in mock mode |
| **Testing** | Vitest + Angular test harness |

---

## 12. Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Standalone Components + Templates)           │
│  - Auth, Admin Layout, Tenant Layout, 20+ pages         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Feature Services                                       │
│  - AdminTenantService, TenantCatalogService,            │
│    TenantOrderService, TenantPeopleService, etc.        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Repository Interfaces (core/repositories/)           │
│  - ProductRepository, OrderRepository, etc.             │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
   MockRepositories              HttpRepositories
   (current)                     (planned)
          │
          ▼
   MockApiStore (in-memory seed data)
```

**Environment toggle:** `useMockApi: true` in `src/environments/environment.development.ts`

**Provider swap path:** Change bindings in `src/app/core/repositories/repository.providers.ts`

---

## 13. Seed / Demo Data

The mock store ships with:

| Tenant | Plan | Status | Email |
|--------|------|--------|-------|
| Sugarblitz | GROWTH | ACTIVE | `hello@sugarblitz.com` |
| BrewLab | PREMIUM | ACTIVE | `owner@brewlab.com` |
| Coffee Haven | STARTER | ACTIVE | `owner@coffeehaven.com` |
| Bean Street | GROWTH | INACTIVE | `owner@beanstreet.com` |
| Roast & Co | STARTER | PENDING | `apply@roastco.com` |
| Daily Grind | GROWTH | PENDING | `hello@dailygrind.com` |

Per active tenant: products, categories, customers, employees, inventory, orders, suppliers, payments, variants, add-ons, shifts, loyalty program, store profile, and settings.

---

## 14. Known Limitations & Assumptions

1. **Prototype stage** — all persistence is in-memory; data changes may not survive full page reload depending on implementation
2. **Single tenant role** — no staff/manager sub-roles within a store
3. **No real auth security** — mock tokens, no password hashing, no OAuth
4. **Settings are UI-only** — 2FA, payment gateway, email provider are not enforced
5. **Image handling** — product images are placeholders; store logo/banner are URL text fields
6. **Currency** — hardcoded USD in UI formatting
7. **Admin sees all tenants** — no regional admin partitioning

---

## 15. Future Roadmap

| Phase | Deliverable |
|-------|-------------|
| **Phase 1** | Implement `Http*Repository` classes matching existing interfaces |
| **Phase 2** | REST API backend with tenant-scoped endpoints |
| **Phase 3** | Swap providers when `useMockApi` is false |
| **Phase 4** | Real auth (JWT), email notifications, billing integration |
| **Phase 5** | Customer-facing ordering channel / POS integration |

---

## 16. Appendix: Route Map

| Path | Audience | Purpose |
|------|----------|---------|
| `/login` | Public | Sign in |
| `/register` | Public | Tenant application |
| `/forgot-password` | Public | Password reset (mock) |
| `/admin/dashboard` | Super Admin | Platform KPIs |
| `/admin/tenants` | Super Admin | Application queue |
| `/admin/tenants/:id` | Super Admin | Tenant deep dive |
| `/tenant/dashboard` | Tenant Owner | Store KPIs |
| `/tenant/products` | Tenant Owner | Product catalog |
| `/tenant/categories` | Tenant Owner | Category management |
| `/tenant/variants` | Tenant Owner | Product variants |
| `/tenant/addons` | Tenant Owner | Order add-ons |
| `/tenant/orders` | Tenant Owner | Order management |
| `/tenant/customers` | Tenant Owner | Customer records |
| `/tenant/loyalty` | Tenant Owner | Loyalty program |
| `/tenant/inventory` | Tenant Owner | Stock management |
| `/tenant/suppliers` | Tenant Owner | Supplier directory |
| `/tenant/employees` | Tenant Owner | Staff management |
| `/tenant/attendance` | Tenant Owner | Time tracking |
| `/tenant/schedule` | Tenant Owner | Shifts & leave |
| `/tenant/payments` | Tenant Owner | Payment records |
| `/tenant/reports` | Tenant Owner | Business reports |
| `/tenant/promotions` | Tenant Owner | Promotions |
| `/tenant/coupons` | Tenant Owner | Coupon codes |
| `/tenant/store` | Tenant Owner | Store profile & branding |
| `/tenant/settings` | Tenant Owner | Workspace settings |

---

## 17. Appendix: Demo Accounts

| Email | Role | Password (mock) |
|-------|------|-----------------|
| `admin@brivio.com` | Super Admin | Any non-empty value |
| `hello@sugarblitz.com` | Tenant Owner (Sugarblitz) | Any non-empty value |
