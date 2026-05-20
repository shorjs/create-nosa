## Dependencies

Keep every package dependency in `package.json` files pinned to an exact stable version. Do not use semver ranges, `latest`, or prerelease tags for dependencies or devDependencies unless the user explicitly asks for that exception.

## Code Guidelines

The codebase should stay lean.

Prefer inline code, logic, functions, and files first. Keep logic in place unless splitting it out is specifically requested, the complexity is already concrete, or the same implementation is being used more than two times.

Do not write optional code or config that only repeats a tool's default behavior. Prefer omitted defaults over explicit self-documenting settings unless changing behavior, correctness, or a user request requires it.
