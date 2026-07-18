# Control plane (landing console)

Shared Postgres with gateway-go. Console APIs write tenants / apps / keys; gateway serves chat/calls.

## Layout

| Module | Role |
|--------|------|
| `accounts.ts` | OAuth upsert, onboarding, credentials |
| `settings.ts` | Workspace / webhook / chat / calls settings |
| `apps.ts` | Tenant apps CRUD (push configs) |
| `usage.ts` | Live meters (`getTenantUsageSnapshot`) — cached 30s |
| `ops.ts` | Key rotation, webhook test ping |
| `keys.ts` / `slug.ts` | Pure helpers |

## Patterns

- Server-only modules: `import "server-only"`.
- Mutations: prefer `withTransaction` from `@/lib/db`.
- Heavy reads: React `cache()` + `unstable_cache` (see `usage.ts`). Tag: `usage:{tenantId}`.
- Client pending UI: `LoadingButton` from `@/components/dashboard/ui`.
- Route UX: `dashboard/loading.tsx` + `dashboard/error.tsx`.

## Hosting notes

- Pool size: `DB_POOL_MAX` (default 4 on Vercel, 10 locally). Statement timeout 15s.
- Never put `pg` in Edge middleware — keep JWT checks in `middleware.ts` / `auth.config.ts`.
- After rotating keys, gateway Redis may keep the old API key ~5 minutes.

## Local checklist

1. Migrations: gateway `make migrate-up` (shared DB).
2. Align `AUTH_URL` + OAuth redirect with `pnpm dev` port.
3. Console env: `DB_*` or `DATABASE_URL` in `.env.local`.
