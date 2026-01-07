# Contributing to Metrex

Thanks for your interest in contributing!

## Development Setup

- **Node.js**: Use Node 18 or 20 (CI uses 18.x, 20.x, and 22 for releases).
- **Install dependencies**: `npm ci`.
- **Verify setup**: Run `npm run check` to execute typecheck, lint, tests, and build.

### Available Scripts

- `npm run check`: Run all checks (typecheck + lint + test + build).
- `npm run typecheck`: TypeScript type checking only.
- `npm run lint`: ESLint linting.
- `npm run lint:fix`: Auto-fix linting issues.
- `npm run format`: Format code with Prettier.
- `npm run test`: Run tests with Vitest.
- `npm run test:watch`: Run tests in watch mode.
- `npm run build`: Build the project.
- `npm run example`: Run the example server after building.

## Development Workflow

1. **Create a feature branch** from `dev`: `git checkout -b feature/my-feature`.
2. **Make changes**: Edit code in `src/`, add tests in `tests/`.
3. **Run checks**: `npm run check` to ensure everything passes.
4. **Format code**: `npm run format`.
5. **Test locally**: `npm run example` for manual testing.
6. **Commit with conventional style**: Use prefixes like `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
7. **Push and create PR**: Push to `dev` branch, create PR to `main`.
8. **CI Validation**: PR triggers automated CI (build, test, lint on Node 18/20).
9. **Merge**: Once approved and CI passes, merge to `main`.

## Automated Processes

- **Dependabot**: Updates dependencies weekly, creates PRs to `dev`, auto-merges if tests pass.
- **CI**: Runs on pushes/PRs to `main`/`dev` with build, test, lint.
- **Releases**: Merging to `main` triggers semantic-release:
  - Analyzes commits for version bumps (feat: minor, fix: patch, BREAKING CHANGE: major).
  - Updates `package.json`, `CHANGELOG.md`.
  - Publishes to npm.
  - Creates GitHub release with notes.

## Pull Requests

- Target `main` branch.
- Include tests for new features and bug fixes.
- Keep diffs focused and well-documented.
- Ensure CI passes.

## Commit Style

- Follow [Conventional Commits](https://conventionalcommits.org/): `type(scope): description`.
- Examples: `feat: add new metric`, `fix: resolve memory leak`, `docs: update README`.

## Code Quality

- **TypeScript**: Strict typing enforced.
- **Linting**: ESLint with Prettier integration.
- **Testing**: Vitest for unit tests, aim for good coverage.
- **Formatting**: Prettier for consistent style.

## Reporting Issues

- **Bugs**: Open an issue with steps to reproduce.
- **Security**: See `SECURITY.md` for private disclosure.

## Additional Notes

- The project uses CommonJS for compatibility.
- Releases are automated; no manual version bumps needed.
- For major changes, ensure backward compatibility or use BREAKING CHANGE in commits.
