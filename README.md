# create-nosa

Create a new nosa project.

## Usage

create-nosa is Bun-only for now.

```bash
bun create nosa@latest
```

Other runners such as `npx`, `pnpm dlx`, and `yarn create` are not supported because the CLI uses Bun runtime APIs.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To check the project:

```bash
bun run lint
bun run ts:check
```
