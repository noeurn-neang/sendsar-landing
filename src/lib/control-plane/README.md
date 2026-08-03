# Control plane (landing console)

Landing is a BFF UI. All console data access goes through the gateway
`/v1/console/*` API (shared Postgres on Contabo). Auth.js / OAuth stays here.

## Layout

| Module | Role |
|--------|------|
| `accounts.ts` | OAuth upsert, onboarding, credentials (HTTP) |
| `settings.ts` | Workspace / webhook / chat / calls settings (HTTP) |
| `apps.ts` | Tenant apps CRUD (HTTP) |
| `usage.ts` | Live meters via console API — cached 30s; plan limits applied locally |
| `ops.ts` | Key rotation, webhook test (HTTP) |
| `keys.ts` / `slug.ts` | Pure helpers (masking / slug UX) |

## Patterns

- Server-only modules: `import "server-only"`.
- Transport: `@/lib/console-api` (`CONSOLE_API_URL` + `CONSOLE_INTERNAL_SECRET`).
- Heavy reads: React `cache()` + `unstable_cache` (see `usage.ts`). Tag: `usage:{tenantId}`.
- After mutate routes succeed, call `revalidateConsoleTags(tenantId)` from `revalidate.ts`.
- Tenant-scoped console GETs pass `accountId` (ownership enforced on gateway).
- Client pending UI: `LoadingButton` from `@/components/dashboard/ui`.
- Route UX: `dashboard/loading.tsx` + `dashboard/error.tsx`.
- Soft-fail usage returns `available: false` — UI must not treat meters as real zeros.

## Hosting notes

- Never put console secret or DB credentials in client bundles.
- Never open Postgres from Vercel — keep Contabo `5433` private.
- After rotating keys, gateway Redis may keep the old API key briefly (cache invalidated on rotate).

## Local checklist

1. Run gateway-go with `CONSOLE_INTERNAL_SECRET` set (migrations via gateway).
2. Align `AUTH_URL` + OAuth redirect with `pnpm dev` port.
3. Console env: `CONSOLE_API_URL` + `CONSOLE_INTERNAL_SECRET` in `.env.local`.
