Welcome to your new TanStack Start app!

# Prerequisites

- Node.js v24.x and pnpm

# Getting Started

```bash
cp .env.example .env
# Fill in your DATABASE_URL in .env, then:
pnpm install
pnpm run db:push
pnpm run dev
```

# Building For Production

```bash
pnpm run build
```

# Project Structure

This template uses a **vertical codebase** — code is grouped by domain rather than by technical layer:

```
src/
  design-system/    # UI primitives (shadcn/ui)
  data/             # Database access (Drizzle ORM)
  errors/           # App-level error normalization and boundaries
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level.

`data/`, `design-system/`, and `errors/` are app-level verticals: shared infrastructure that can grow with the app, not feature verticals like `auth/` or `billing/`.

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with TanStack Form and Zod included.

To switch to a different preset:

```bash
pnpm exec shadcn apply --preset <preset-code>
```

Named presets include `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`.

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

Copy `.env.example` to `.env` and fill in your `DATABASE_URL`.

Available commands:

```bash
pnpm run db:generate
pnpm run db:migrate
pnpm run db:push
pnpm run db:studio
```

## TanStack Form

[TanStack Form](https://tanstack.com/form) is included with the shadcn/ui setup and uses [Zod](https://zod.dev/) validation.

Forms use the shadcn/ui `Field` component family for layout and error display.

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
