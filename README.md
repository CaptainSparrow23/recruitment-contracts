# @recruitment/contracts

The shared protocol package — the single source of truth for the HTTP and WebSocket message shapes (plus the runtime validators) used by both [`@recruitment/backend`](../Recruitment_Backend/README.md) and the [`sorinai`](../Recruitment_Copilot/README.md) desktop app.

## Why it exists

The frontend and backend never import each other; they talk only over HTTP, WebSocket, and IPC. This package holds the transport contracts in one place so both sides type-check against the same definitions. Keep transport types here — do not duplicate them in either app.

## Modules (`src/`)

| Module | Holds |
|---|---|
| `index.ts` | Re-exports everything from the other modules (`export * from ...`). |
| `http.ts` | HTTP path constants (`HEALTH_PATH`, `SESSIONS_PATH`, …) plus request/response types for sessions, billing, org, chat, folders, templates, etc. |
| `ws.ts` | WebSocket message types (client→server and server→client), copilot intents, qualification field statuses, `PROTOCOL_VERSION`, and the runtime validator `isClientMessage`. |
| `calendar.ts` | Calendar providers, event shapes, and manual-event colors. |
| `sessionTitle.ts` | `resolveSessionTitle` / `hasResolvedSessionTitle` — title-resolution helpers used by both apps. |

## Subpath exports

The package exposes typed ESM subpaths (see `package.json` `exports`):

| Import | Module |
|---|---|
| `@recruitment/contracts` | everything (`index.ts`) |
| `@recruitment/contracts/http` | `http.ts` |
| `@recruitment/contracts/ws` | `ws.ts` |
| `@recruitment/contracts/calendar` | `calendar.ts` |

(`sessionTitle.ts` is re-exported through the root entry.)

## Protocol version

`PROTOCOL_VERSION` (in `ws.ts`, currently `"2026-04-01"`) is the WS protocol version. It is reported by the backend `/health` endpoint and in the `session:started` payload so client and server can detect a mismatch.

## Runtime validators

The exported runtime guard is `isClientMessage(value): value is ClientMessage` — the backend runs it on every inbound WebSocket message before handling it, so malformed or unknown messages are rejected at the boundary. The per-message-type checks it delegates to are internal to the module.

## Scripts

| Script | What it does |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` (the published/consumed output) |
| `npm run check` | Type-check only (`tsc --noEmit`) |

## Build-before-consume workflow

Both apps consume this package via local `file:` dependencies and import the **compiled** `dist/`. After any change here you must rebuild before the change is visible downstream:

```bash
npm install        # first time only
npm run build      # then restart the backend and/or Electron app
```

Forgetting to rebuild is the usual cause of "my new field isn't there" — the consumers are reading stale `dist/`.

See the [docs hub](../docs/architecture.md) for how the packages fit together.
