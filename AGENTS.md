# Instructions

Always refer to these global skills first if any:

- `bun`
- `bun-strict`

If above skills are not found, suggest and encourage to install it first.

# Project Overview

`create-nosa` is the Bun first project scaffolder for nosa.

The CLI should stay lean, interactive, and easy to extend. The first flow should collect

- project name,
- template,
- add ons,
- init git or not,
- run bun install or not,
- generate the project and print the next commands to start development.

The primary target is Bun projects. Non Bun runtimes or package managers may work where compatible, but they are not the main concern.

Use modern CLI building blocks where they reduce code and improve DX. Prefer `@clack/prompts` for the interactive flow, Bun APIs for running commands, and standard filesystem utilities for copying and editing files. Add a CLI framework only when flags, help output, or non interactive usage become worth supporting.

Avoid `node:*` imports when Bun has a native API for the same job. Use Bun APIs for file reads, file writes, command execution, runtime behavior, and package manager workflows. Use `node:*` only for gaps that Bun documents as Node-compatible usage, such as directory traversal, directory creation, stats, and path manipulation.

Prefer inline implementation first over premature abstraction. Keep logic in place unless splitting it out is specifically requested or the complexity is already concrete.

Templates should be simple to reason about. Start with a small set of base templates, then apply selected add ons on top instead of maintaining many duplicated template variants.
