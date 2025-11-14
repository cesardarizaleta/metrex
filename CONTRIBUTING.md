# Contributing to Metrex

Thanks for your interest in contributing!

## Development

- Use Node 18 or 20.
- Install deps: `npm ci`.
- Build: `npm run build`. Type-check only: `npm run typecheck`.
- Run tests: `npm test` (watch: `npm run test:watch`).
- Lint/format: `npm run lint` and `npm run format`.

## Pull Requests

- Create a feature branch from `dev`.
- Include tests for new features and bug fixes.
- Keep diffs focused and documented in the PR description.
- Ensure CI passes (typecheck, lint, build, tests).

## Commit Style

- Use clear, descriptive messages (e.g., `feat: add percentile helper`).

## Reporting Security Issues

- Please see `SECURITY.md` for private disclosure instructions.
