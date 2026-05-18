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

The generated templates still include `bun.lock` and use Bun by default.

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

Complete templates:

- `start-simple`
- `start-simple-shadcn`

The other template combination folders are placeholders until their full copies are added.

### `start-simple`

Lean TanStack Start template which includes:

- **Framework**: [TanStack Start](https://tanstack.com/start) with React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Tooling**: [Oxc](https://oxc.rs/) with `oxlint` and `oxfmt`
- **Git Hooks**: `simple-git-hooks` and `nano-staged`

### `start-simple-shadcn`

The simple Start template with the `shadcn/ui` add-on applied. It includes everything from `start-simple`, plus:

- **UI**: `shadcn/ui` configuration
- **Component**: a generated `Button` component
- **Utilities**: `cn()` with `clsx` and `tailwind-merge`
- **Theme**: shadcn Tailwind CSS variables and Roboto font setup
