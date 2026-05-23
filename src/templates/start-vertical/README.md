Welcome to your new TanStack Start app!

# Prerequisites

- [Bun](https://bun.sh/) v1.x

# Getting Started

```bash
bun install
bun run dev
```

# Building For Production

```bash
bun run build
```

# Project Structure

This template uses a **vertical codebase** — code is grouped by domain rather than by technical layer:

```
src/
  errors/           # App-level error normalization and boundaries
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level. For example:

`errors/` is an app-level vertical: shared infrastructure that can grow with the app, not a feature vertical like `auth/` or `billing/`.

- `src/auth/` for authentication
- `src/billing/` for billing
- `src/data/db/` for database access

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
