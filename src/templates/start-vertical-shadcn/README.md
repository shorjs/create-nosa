Welcome to your new TanStack Start app!

# Prerequisites

- [Bun](https://bun.sh/) v1.x

# Getting Started

```bash
bun install
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
  errors/           # App-level error normalization and boundaries
  welcome/          # Landing page domain
  counter/          # Interactive demo domain
  routes/           # Route definitions (required by TanStack Router)
  router.tsx        # Router configuration
  styles.css        # Global styles
```

Each directory owns its components, types, server functions, and schemas. As you add features, create new directories at `src/` level.

`design-system/` and `errors/` are app-level verticals: shared infrastructure that can grow with the app, not feature verticals like `auth/` or `billing/`.

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with TanStack Form and Zod included.

To switch to a different preset:

```bash
bunx shadcn apply --preset <preset-code>
```

Named presets include `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`.

## TanStack Form

[TanStack Form](https://tanstack.com/form) is included with the shadcn/ui setup and uses [Zod](https://zod.dev/) validation.

Forms use the shadcn/ui `Field` component family for layout and error display.

# Learn More

- [TanStack Start docs](https://tanstack.com/start)
- [TanStack Router docs](https://tanstack.com/router)
