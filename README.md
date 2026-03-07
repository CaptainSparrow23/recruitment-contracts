# Recruitment Contracts

Shared TypeScript contract package for the Recruitment frontend and backend.

## Purpose

This package is the shared source of truth for:

- HTTP response shapes
- WebSocket message types
- protocol constants

## Scripts

- `npm run build`
- `npm run check`

## Local Development

```bash
npm install
npm run build
```

If you change the contracts, rebuild this package before rebuilding or restarting:

- `../Recruitment_Backend`
- `../Recruitment_Copilot`

## Notes

- This package is consumed through local `file:` dependencies for now.
- Keep transport contracts here instead of duplicating them in frontend or backend code.
