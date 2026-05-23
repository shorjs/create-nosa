Code is grouped by domain — each vertical is a directory you add and delete freely. At scale:

```
src/
  auth/
    auth.server.ts      — server-only: betterAuth instance, DB adapter
    auth-client.ts      — isomorphic: createAuthClient (community convention)
    auth.functions.ts   — isomorphic: server functions
    auth.schema.ts      — isomorphic: drizzle auth tables
    components/
      sign-in.tsx
      sign-up.tsx

  billing/
    billing.functions.ts
    billing.server.ts
    billing-client.ts
    billing.schema.ts
    components/
      pricing-table.tsx
      invoice-list.tsx

  teams/
    teams.functions.ts
    teams.server.ts
    teams-client.ts
    teams.schema.ts
    components/
      team-switcher.tsx
      member-list.tsx
      invite-dialog.tsx

  data/
    db/        (index.ts, schema.ts)
    cache/     (index.ts, keys.ts)
    storage/   (index.ts, upload.ts)

  design-system/
    ui/  (button.tsx, input.tsx, card.tsx, ...)
    utils.ts

  routes/     (required by TanStack Router)
  router.tsx
  routeTree.gen.ts
  styles.css
```

Each vertical owns its components, server functions, types, schemas, and hooks. Delete its directory to remove the feature.

## File Naming

TanStack Start reserves these extensions for import protection:

| Extension    | Scope       | Use for                                                                                |
| ------------ | ----------- | -------------------------------------------------------------------------------------- |
| `.server.ts` | Server-only | DB access, secrets, server APIs (stripped from client bundle)                          |
| `.client.ts` | Client-only | Browser-only APIs — `window`, `document`, `localStorage` (stripped from server bundle) |
| _(none)_     | Isomorphic  | Everything else                                                                        |

`*-client.ts` (hyphen, not dot) is an unrelated community convention for isomorphic client modules (e.g., Better Auth's `auth-client`). It does not trigger TanStack Start's import protection — it's just an ordinary file.
