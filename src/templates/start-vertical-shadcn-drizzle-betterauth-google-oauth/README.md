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
  design-system/    # UI primitives (shadcn/ui)
  auth/             # Authentication (Better Auth)
  data/             # Database access (Drizzle ORM)
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level.

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with TanStack Form and Zod included.

To switch to a different preset:

```bash
bunx shadcn apply --preset <preset-code>
```

Named presets include `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`.

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

This project uses [Better Auth](https://better-auth.com) with Google OAuth for Google sign-in.

Add to your `.env`:

```
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://127.0.0.1:7331
GOOGLE_CLIENT_ID=<Google OAuth web client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth web client secret>
```

### Google OAuth Setup

Create separate Google Cloud projects for development and production so each environment has its own OAuth app configuration and credentials.

| Environment | GCP project name example | GCP project ID example |
| ----------- | ------------------------ | ---------------------- |
| Development | `my-app dev`             | `my-app-dev`           |
| Production  | `my-app prod`            | `my-app-prod`          |

Each project gets its own OAuth web client with URIs scoped to that environment only:

Development project:

```
Authorized JavaScript origin: http://127.0.0.1:7331
Authorized redirect URI:     http://127.0.0.1:7331/api/auth/callback/google
```

Production project:

```
Authorized JavaScript origin: https://your-domain.com
Authorized redirect URI:     https://your-domain.com/api/auth/callback/google
```

Important: for new OAuth clients, Google only shows the full client secret when the client is created. Save it immediately to a secure place such as `.env`, a password manager, or Secret Manager. After creation, only the last four characters are visible. If you lose it, use **Add Secret** to rotate a new one.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create the project for the environment.
2. Go to **Google Auth Platform** > **Branding** and click **Get Started** if the project has not been configured yet.
3. Enter an app name — for dev environments use something like `my-app dev` (only test users see it), for production use just `my-app` since the consent screen is user-facing. Select a support email, choose **External** unless the app is limited to your Google Workspace organization, add your developer contact email, accept the user data policy, and continue.
4. On **Audience**, add yourself under **Test users** while the app is in testing mode.
5. On **Data Access**, keep scopes minimal. Basic Google sign-in only needs the profile and email identity scopes; do not add Gmail, Drive, Calendar, or other API scopes unless the app actually uses those APIs.
6. Go to **Google Auth Platform** > **Clients** > **Create Client** > **Web application**.
7. Set a name that identifies the environment, such as `my-app-dev-web` or `my-app-prod-web`.
8. Add the authorized JavaScript origin and redirect URI for that environment.
9. Click **Create** and copy the client ID and client secret immediately.
10. Add them to `.env`:

```
GOOGLE_CLIENT_ID=<client ID>
GOOGLE_CLIENT_SECRET=<client secret>
```

11. Make sure `BETTER_AUTH_URL` matches the origin in the Google client, then restart `bun run dev` after changing `.env`.

## TanStack Form

[TanStack Form](https://tanstack.com/form) is included with the shadcn/ui setup and uses [Zod](https://zod.dev/) validation.

Forms use the shadcn/ui `Field` component family for layout and error display.

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
