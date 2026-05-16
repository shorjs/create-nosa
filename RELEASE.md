# Release

Maintainer notes for releasing `create-nosa`.

## Branch Rules

GitHub settings that must be configured manually:

- Path: `Settings -> Branches -> Add branch ruleset`
- Target: default branch
- Require pull requests before merging
- Allow squash merge only
- Require status check: `Lint and typecheck`
- Require branches to be up to date
- Block force pushes
