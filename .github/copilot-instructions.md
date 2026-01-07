# GitHub Copilot Instructions for Metrex

## Project Overview
Metrex is an Express.js middleware for API metrics and dashboard. It instruments requests, tracks RPS, latencies, status codes, and top routes. Built with TypeScript, uses Vitest for testing, ESLint for linting, Prettier for formatting.

## Code Style and Conventions
- **Language**: TypeScript (strict mode).
- **Module System**: CommonJS (for compatibility).
- **Imports**: Use ES6 imports in source, CommonJS in built output.
- **Naming**: CamelCase for variables/functions, PascalCase for classes/types.
- **Error Handling**: Use try/catch, throw descriptive errors.
- **Async**: Prefer async/await over Promises.
- **Comments**: JSDoc for public APIs, inline for complex logic.

## Development Workflow
- **Branching**: Feature branches from `dev`, PR to `main`.
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.).
- **Testing**: Write unit tests for new features, aim for high coverage.
- **Linting/Formatting**: Run `npm run lint` and `npm run format` before committing.
- **Build**: Ensure `npm run build` passes.
- **Automation**: Dependabot handles updates, CI validates, semantic-release publishes.

## Key Files and Structure
- `src/`: Source code (index.ts, instrumentation.ts, etc.).
- `tests/`: Vitest tests.
- `dist/`: Built output (auto-generated).
- `example/`: Demo server.
- `.github/workflows/`: CI and release automation.

## Best Practices
- **Security**: Avoid vulnerabilities, use latest deps via Dependabot.
- **Performance**: Efficient code, minimal overhead.
- **Documentation**: Update README for API changes.
- **PRs**: Include tests, keep focused, ensure CI passes.
- **Issues**: Use templates, provide repro steps.

## Copilot Guidelines
- Suggest TypeScript types explicitly.
- Prefer functional programming where possible.
- Recommend tests for code suggestions.
- Follow existing patterns in the codebase.
- Avoid deprecated APIs.
- For Express middleware, suggest proper req/res handling.

## Examples
- **Adding a metric**: Implement in instrumentation.ts, add test in tests/.
- **New endpoint**: Update dashboard.ts, ensure JSON response.
- **Config option**: Add to types.ts, validate in useMetrex.

Use these instructions to provide accurate, context-aware suggestions aligned with the project's standards.