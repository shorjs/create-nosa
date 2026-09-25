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

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
