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

The generated templates still include `bun.lock`, include `bunfig.toml`, and use Bun by default.

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
```

## Templates

Templates live in [`src/templates`](./src/templates). Each supported combination is intended to be a complete static folder that the CLI can copy directly.

Current option status:

- **Template**: Start
- **Structure**: Simple is available; Vertical is planned
- **Add-ons**: shadcn/ui, Drizzle + PostgreSQL, and shadcn/ui + Drizzle + PostgreSQL are available for Simple; Better Auth is planned

Placeholder folders remain for planned combinations until their full static copies are added.

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
