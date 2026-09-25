Welcome to your new TanStack Start app!

# Prerequisites

- Node.js v24.x and pnpm

# Getting Started

```bash
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in .env, then:
pnpm install
pnpm run db:push
pnpm run dev
```

# Building For Production

```bash
pnpm run build
```

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

## Authentication

This project uses [Better Auth](https://better-auth.com) with a database-backed auth setup. No sign-in method is enabled by default; add the provider or passwordless flow your app needs.

Add to your `.env`:

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://127.0.0.1:7331
```

Generate the auth schema and push to the database:

```bash
pnpm dlx @better-auth/cli@1.4.21 generate --output src/db/auth.schema.ts
pnpm run db:push
```

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
