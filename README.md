# create-nosa

Scaffolding for nosa projects.

`create-nosa` is a Bun first project generator. It runs an interactive setup flow, copies a selected template, installs dependencies with Bun, initializes git, and creates an initial commit.

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

The CLI currently runs in interactive mode, but you can also specify your project name and template with command line arguments.

```bash
# bun
bun create nosa@latest my-nosa-app --template start
# bunx
bunx --bun create-nosa@latest my-nosa-app --template start
```

Add ons can also be selected without prompting.

```bash
bun create nosa@latest my-nosa-app --template start --addon shadcn
```

## Templates

| Name    | Description                      |
| :------ | :------------------------------- |
| `start` | TanStack Start with Tailwind CSS |

Templates live in [`templates`](./templates). Each template has a `meta.json` file for the prompt label and a `files` directory containing the generated project files.

Other runners such as `npx`, `pnpm dlx`, and `yarn create` are not supported because the CLI uses Bun runtime APIs.

## CLI Flags

May be provided in place of prompts

| Name                | Description                             |
| :------------------ | :-------------------------------------- |
| `--help` (`-h`)     | Display available flags.                |
| `--template <name>` | Select a template without prompting.    |
| `--addon <id>`      | Select an add on without prompting.     |
| `--yes` (`-y`)      | Skip all prompts by accepting defaults. |

### The `start` Template

Very lean starter template which includes:

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Tooling**: [Oxc](https://oxc.rs/) (`oxlint` + `oxfmt`) Fast linting and formatting
- **Git Hooks**: `simple-git-hooks` + `nano-staged` for commit auto-formatting and linting
- **Add-ons**: Optional `shadcn` addon for `shadcn/ui`
