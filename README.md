# create-nosa

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

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Main branch ruleset

GitHub settings that must be configured manually:

- Path: `Settings -> Branches -> Add branch ruleset`
- Target: default branch
- Require pull requests before merging
- Allow squash merge only
- Require status check: `Lint and typecheck`
- Require branches to be up to date
- Block force pushes
