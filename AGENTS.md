# Project Overview

`create-nosa` is a project scaffolder for nosa.

Minimal usage:

```bash
bun create nosa
```

## The interactive flow

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

## Selection Tree

```text
create-nosa
`- Project name
   `- Template
      `- Start
         `- Codebase structure
            |- Simple
            |  `- Add-ons
            |     |- None
            |     |- shadcn/ui
            |     |- Drizzle + PostgreSQL
            |     |  `- Optional: Better Auth
            |     |- shadcn/ui + Drizzle + PostgreSQL
            |     |  `- Optional: Better Auth
            |     `- Better Auth
            |        `- Auto-includes Drizzle + PostgreSQL
            |
            `- Vertical
               `- Add-ons
                  |- None
                  |- shadcn/ui
                  |- Drizzle + PostgreSQL
                  |  `- Optional: Better Auth
                  |- shadcn/ui + Drizzle + PostgreSQL
                  |  `- Optional: Better Auth
                  `- Better Auth
                     `- Auto-includes Drizzle + PostgreSQL
```

# Instructions

The codebase should stay lean.

Prefer inline code, logic, functions, and files first. Keep logic in place unless splitting it out is specifically requested, the complexity is already concrete, or the same implementation is being used more than two times.

Do not write optional code or config that only repeats a tool's default behavior. Prefer omitted defaults over explicit self-documenting settings unless changing behavior, correctness, or a user request requires it.

# Stacks

- `@clack/prompts` for the interactive CLI
- `effect` + `@effect/platform` + `@effect/platform-bun` for typed effects, file system, and command execution
- `Bun` for runtime, file system operations, and package management

# Dependency Versions

Keep every package dependency in `package.json` files pinned to an exact stable version. Do not use semver ranges, `latest`, or prerelease tags for dependencies or devDependencies unless the user explicitly asks for that exception.

# Objective

## Compatibility

Although we are developing `create-nosa` in a Bun environment and we are favoring on first class support of `bun`, the output codebase should be compatible with both Bun and Other Node supported package manager.

It means usage below should also be valid for users of others package manager

```bash
# npx
npx create nosa
# yarn dlx
yarn dlx create nosa
# pnpm dlx
pnpm dlx create nosa
```

Those invocation methods are supported, but every generated template still uses Bun because each template includes a `bun.lock` file. User can switch to their preferred package manager by manually inferring `bun.lock` to their preferred package manager lock file and installing dependencies with it.

## Implementation

Use full template copies. Each supported combination of base template, codebase structure, and add-ons is a complete static folder shipped with the CLI.

## Generated Template File Naming

Templates include a basic `src/AGENTS.md`.

`routeTree.gen.ts` is excluded from templates — it gets generated automatically by the TanStack Router Vite plugin when the user runs `bun run dev`. Refer to the outro message we show at the end of scaffolding for context.
