Welcome to your new TanStack Start app!

# Prerequisites

- [Bun](https://bun.sh/) v1.x

# Getting Started

```bash
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in .env, then:
bun install
bun run db:push
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
  auth/             # Authentication (Better Auth)
  data/             # Database access (Drizzle ORM)
  errors/           # App-level error normalization and boundaries
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level.

`data/` and `errors/` are app-level verticals: shared infrastructure that can grow with the app, not feature verticals like `auth/` or `billing/`.

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

Copy `.env.example` to `.env` and fill in your `DATABASE_URL`.

Available commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
```

## Authentication

This project uses [Better Auth](https://better-auth.com) with a database-backed auth setup. No sign-in method is enabled by default; add the provider or passwordless flow your app needs.

Add to your `.env`:

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://127.0.0.1:7331
```

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
