# Agents

## File Naming

- `.server.ts` — server-only (DB, secrets). Stripped from client bundle.
- `.client.ts` — client-only (browser APIs). Stripped from server bundle.
- No suffix — isomorphic. Runs on both.

`*-client.ts` (hyphen, not dot) is a community convention (e.g., `auth-client`). It's just a regular file.
