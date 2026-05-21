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

# Project Structure

This template uses a **vertical codebase** — code is grouped by domain rather than by technical layer:

```
src/
  auth/             # Authentication (Better Auth)
  data/             # Database access (Drizzle ORM)
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level.

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

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
