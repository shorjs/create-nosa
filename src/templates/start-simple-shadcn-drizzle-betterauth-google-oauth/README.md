Welcome to your new TanStack Start app!

# Prerequisites

- [Bun](https://bun.sh/) v1.x

# Getting Started

```bash
cp .env.example .env
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
# GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in .env, then:
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

This project uses [Better Auth](https://better-auth.com) with Google OAuth.

Add to your `.env`:

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://127.0.0.1:7331
GOOGLE_CLIENT_ID=<Google OAuth web client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth web client secret>
```

### Google OAuth Setup

Use separate Google Cloud projects for development and production so each environment has its own OAuth consent screen and credentials.

| Environment | GCP project name example | GCP project ID example |
| ----------- | ------------------------ | ---------------------- |
| Development | `my-app dev`             | `my-app-dev`           |
| Production  | `my-app prod`            | `my-app-prod`          |

Each project gets its own OAuth web client with URIs scoped to that environment only.

Development web client:

```
Authorized JavaScript origin: http://127.0.0.1:7331
Authorized redirect URI:     http://127.0.0.1:7331/api/auth/callback/google
```

Production web client:

```
Authorized JavaScript origin: https://your-domain.com
Authorized redirect URI:     https://your-domain.com/api/auth/callback/google
```

Copy the client secret when you create it. If you lose it, rotate a new secret and update your environment variables.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create the project for the environment.
2. Go to **Google Auth Platform** > **Branding** and complete the consent screen setup.
3. Use an app name that clearly identifies the environment, such as `my-app dev` or `my-app prod`.
4. Add yourself under **Test users** while the app is in testing mode.
5. Keep scopes minimal. Basic sign-in only needs the default `openid`, `userinfo.email`, and `userinfo.profile` scopes.
6. Go to **Google Auth Platform** > **Clients** > **Create Client** > **Web application**.
7. Add the authorized JavaScript origin and redirect URI for the environment.
8. Add the client ID and client secret to `.env`.
9. Restart `bun run dev` after changing `.env`.

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
