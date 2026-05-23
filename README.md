# create-nosa

Scaffolding for nosa projects.

`create-nosa` is a Bun first project generator. It runs an interactive setup flow, copies a selected static template folder, installs dependencies with Bun when the selected template is complete, initializes git, and prints the next commands.

## Requirements

- Bun `>=1.3.0`
- Git

Nix users can optionally run `nix develop` to enter a shell with Bun and Git.

## Usage

With Bun:

```bash
bun create nosa@latest
```

You can also run the package directly:

```bash
bunx --bun create-nosa@latest
```

Other package runners can invoke the CLI too:

```bash
npx create nosa
yarn dlx create nosa
pnpm dlx create nosa
```

The generated templates include `bunfig.toml` and use Bun by default. A fresh `bun.lock` is generated during `bun install`.

## Interactive Flow

```text
? Project name
  my-nosa-app

? Select a template
  Start

? Select codebase structure
  Simple
  Vertical

? Select add-ons
  [ ] shadcn/ui
  [ ] Drizzle + PostgreSQL
  [ ] Better Auth
  [ ] Google OAuth
```

## Non-interactive Usage

All prompts can be skipped by passing flags:

```bash
bun create nosa --name my-app --structure simple --addons shadcn,drizzle
```

| Flag              | Values                                                              | Description        |
| ----------------- | ------------------------------------------------------------------- | ------------------ |
| `-n, --name`      | any folder name                                                     | Project name       |
| `-t, --template`  | `start`                                                             | Template           |
| `-s, --structure` | `simple`, `vertical`                                                | Codebase structure |
| `-a, --addons`    | `shadcn`, `drizzle`, `betterauth`, `google-oauth` (comma-separated) | Add-ons            |
| `-h, --help`      |                                                                     | Show help          |

Any omitted flag falls through to the interactive prompt for that field.

## Templates

Templates live in [`src/templates`](./src/templates). Each supported combination is intended to be a complete static folder that the CLI can copy directly.

Current option status:

- **Template**: Start
- **Structure**: Simple and Vertical
- **Add-ons**: shadcn/ui, Drizzle + PostgreSQL, Better Auth (auto-includes Drizzle), Google OAuth (auto-includes Better Auth and Drizzle), and their shadcn/ui variants

## Vertical Philosophy

Code is grouped by domain rather than by technical layer. Each feature lives in its own directory so you can own it, evolve it, and eventually throw it away.

```
src/
  auth/             # Authentication domain
  billing/          # Billing domain
  plans/            # Plan management domain
  teams/            # Teams and collaboration domain
  data/             # Database access
  design-system/    # Shared UI primitives
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, hooks, server functions, types, and schemas. Add new verticals by creating a directory at `src/`. Remove a feature by deleting its directory.

### Base

Lean TanStack Start template which includes:

- **Framework**: [TanStack Start](https://tanstack.com/start) with React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Tooling**: [Oxc](https://oxc.rs/) with `oxlint` and `oxfmt`
- **Git Hooks**: `simple-git-hooks` and `nano-staged`

### Add-ons

`shadcn/ui` adds:

- **UI**: `shadcn/ui` configuration
- **Component**: a generated `Button` component
- **Utilities**: `cn()` with `clsx` and `tailwind-merge`
- **Theme**: shadcn Tailwind CSS variables and Roboto font setup

Drizzle + PostgreSQL adds:

- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) configured for PostgreSQL
- **Driver**: `pg` through `drizzle-orm/node-postgres`
- **Schema**: starter `users` table in `src/db/schema.ts`
- **Commands**: `db:generate`, `db:migrate`, `db:push`, and `db:studio`

Better Auth adds:

- **Auth**: [Better Auth](https://better-auth.com) with database-backed session handling and no sign-in method enabled by default
- **Integration**: TanStack Start handler at `src/routes/api/auth/$.ts`
- **Server functions**: session helpers in `src/lib/auth.functions.ts`
- **Drizzle schema**: auto-generated auth tables in `src/db/auth-schema.ts`
- **Dependencies**: `better-auth` with `tanstackStartCookies` plugin

Google OAuth adds:

- **Provider**: Google social sign-in through Better Auth
- **Environment**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Example**: a dedicated Google OAuth example
