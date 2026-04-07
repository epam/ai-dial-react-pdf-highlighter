# Contributing to @epam/ai-dial-react-pdf-highlighter

Thank you for your interest in contributing to this project. This document provides practical
guidelines for contributing code, tests, and documentation.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Component Development](#component-development)
- [PR Guidelines](#pr-guidelines)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Code of Conduct](#code-of-conduct)

## Development Workflow

### Branching Strategy

Use this branching approach:

- `main` - stable branch for releases
- `<feature-or-fix-name>` - short-lived development branches

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b your-feature-name
```

### Local Development

```bash
npm install
npm run storybook    # visual development (port 6006)
npm run test:run     # run tests once
npm run typecheck    # TypeScript check
npm run lint         # ESLint with auto-fix
```

## PR Guidelines

- Keep PRs focused and reasonably small.
- Describe what changed, why, and how it was validated.
- Include screenshots for Storybook-visible UI changes when relevant.
- Do not include unrelated refactors in feature/fix PRs.

## Component Development

### Component Guidelines

1. **File Structure**: Each component should have its own directory under `src/components/` with:
   - `ComponentName.tsx` - main component
   - `ComponentName.spec.tsx` - unit tests
   - `ComponentName.stories.tsx` - Storybook stories
2. **TypeScript**:
   - Use explicit prop interfaces and strict typing
   - Avoid `any` unless there is no safer option
   - Export public types when they are part of component API
3. **Styling**:
   - Use Tailwind-based project styles and existing design tokens
   - Prefer `@epam/ai-dial-ui-kit` components over raw HTML when suitable
   - Avoid inline styles unless there is a clear reason
4. **Update policy**:
   - Avoid breaking changes in public API unless explicitly planned
   - Keep public exports updated in `src/index.ts`
5. **Documentation**:
   - Add or update stories when behavior/props change
   - Add concise docs/comments where logic is non-obvious

### Storybook Stories

Every public component must have Storybook stories that cover primary states and key props.

## Testing

### Testing Requirements

- **Framework**: Vitest + React Testing Library
- **Unit Tests**: Every component change should be covered by tests
- **Coverage**: Keep coverage at or above the existing project baseline

### Testing Guidelines

- Prefer accessible queries (`getByRole`, `getByLabelText`) over test IDs.
- Test behavior and user-observable outcomes, not implementation details.
- Move complex pure logic into utility functions and test separately.

### Test Commands

```bash
npm run test:run   # run once, no coverage
npm run test       # run with coverage
```

## Code Style

### Linting and Formatting

```bash
npm run lint         # ESLint with auto-fix
npm run lint:check   # ESLint check only
npm run format       # Prettier check
npm run format-fix   # Prettier write
```

### Code Style Guidelines

- Use functional components and hooks.
- Prefer explicit typing and clear prop contracts.
- Keep components focused and composable.
- Use meaningful names for variables, props, and functions.
- Follow patterns documented in `AGENTS.md`.

## Pull Request Process

### Before Submitting

1. **Run Quality Checks**
   Do not skip local checks before opening PR:

   ```bash
   npm run typecheck
   npm run lint:check
   npm run test:run
   ```

2. **Update Documentation**
   - Update stories if component behavior changed
   - Update README if public API/usage changed
   - Mention breaking changes clearly in PR description

### Review Process

- At least one approval is required.
- CI checks must pass.
- Address review feedback before merge.

## Release Process

### Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: breaking API changes
- **MINOR**: backward-compatible features
- **PATCH**: backward-compatible fixes

Use `npm run publish:dry` to validate release flow without publishing.

## Code of Conduct

For broader DIAL project contribution norms, see
[EPAM AI DIAL Contributing Guide](https://github.com/epam/ai-dial/blob/main/CONTRIBUTING.md).
