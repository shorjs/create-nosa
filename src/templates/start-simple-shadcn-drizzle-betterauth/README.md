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

This project uses [Better Auth](https://better-auth.com) with email and password authentication.

Add to your `.env`:

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

Generate the auth schema and push to the database:

```bash
bunx @better-auth/cli@latest generate --output src/db/auth-schema.ts
bun run db:push
```

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/).

To switch to a different preset:

```bash
bunx shadcn apply --preset <preset-code>
```

Named presets include `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`.

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
