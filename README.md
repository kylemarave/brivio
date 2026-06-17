# Brivio

Multi-tenant coffee shop SaaS platform built with Angular 21. Super admins review tenant applications; approved store owners manage their workspace.

## Architecture

```
Component → Feature Service → Repository (interface) → Mock implementation
```

- **Entities** live in `src/app/core/models/`
- **DTOs** live in `src/app/core/models/dtos/`
- **Repositories** in `src/app/core/repositories/` with mock implementations in `mock/`
- Swap mock repos for HTTP implementations by changing providers in `repository.providers.ts`

Set `useMockApi: true` in `src/environments/environment.development.ts`.

## Demo accounts

| Email | Role |
|-------|------|
| `admin@brivio.com` | Super Admin |
| `hello@sugarblitz.com` | Tenant Owner (Sugarblitz) |

Any non-empty password works in mock mode.

## Development

```bash
npm start
```

Open `http://localhost:4200/`

## Routes

### Auth
- `/login` — Sign in
- `/register` — Tenant application
- `/forgot-password` — Password reset (mock)

### Admin (`SUPER_ADMIN`)
- `/admin/dashboard` — Platform overview
- `/admin/tenants` — Tenant applications
- `/admin/tenants/:id` — Tenant detail & plan management

### Tenant (`TENANT_OWNER`)
- `/tenant/dashboard` — Store KPIs
- `/tenant/products`, `/categories`, `/variants`, `/addons` — Catalog
- `/tenant/orders`, `/customers`, `/loyalty` — Sales
- `/tenant/inventory`, `/suppliers` — Operations
- `/tenant/employees`, `/attendance`, `/schedule` — People
- `/tenant/payments`, `/reports` — Finance
- `/tenant/promotions`, `/coupons` — Marketing
- `/tenant/store`, `/settings` — Store profile & settings

## Build

```bash
npm run build
npm test
```

## Real backend next steps

1. Add `HttpClient` and `Http*Repository` classes matching existing repository interfaces
2. Set `{ provide: ProductRepository, useClass: HttpProductRepository }` when `useMockApi` is false
3. Implement REST endpoints documented in repository interfaces
