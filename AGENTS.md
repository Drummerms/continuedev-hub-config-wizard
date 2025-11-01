# Repository Guidelines

## Project Structure & Module Organization
The repository currently centers on `spec_1_continue_dev_hub_configuration_wizard.md`; treat it as the canonical product brief. House implementation in a Next.js `src/` tree: `src/app` for routes, `src/components` for shared UI, `src/schema` for the Zod config model, `src/lib` for helpers, and `public/` for assets. Keep unit fixtures in `tests/`, scenarios in `e2e/`, and update the spec before reshaping architecture.

## Build, Test, and Development Commands
Use `pnpm` to manage the workspace.
- `pnpm install` aligns dependencies with the lockfile.
- `pnpm dev` starts the Next.js dev server with YAML preview.
- `pnpm build` emits the production bundle and refreshes JSON schema artifacts.
- `pnpm test` runs unit suites.
- `pnpm test:e2e` runs Playwright flows for create/import/edit/export.
Document new scripts in `package.json` and update this list.

## Coding Style & Naming Conventions
Enable TypeScript strict mode and declare explicit return types on exports. Prefer functional React components; use `PascalCase` filenames for components, `camelCase` for utilities, and reserve `kebab-case` for YAML preset files. Keep indentation at two spaces, avoid tabs, and run `pnpm lint` (ESLint + Prettier) plus `pnpm format` before pushing. Store schema constants in `ALL_CAPS`, preset identifiers in `PascalCase`, and environment placeholders as `${VAR}` or `${{ secrets.KEY }}`.

## Testing Guidelines
Unit tests (Vitest or Jest) sit alongside sources under `src/**/__tests__` and must cover schema shape, validator behavior, YAML sync, and UI helpers. E2E tests in `e2e/` should exercise the wizard’s primary flows plus anchors/aliases preservation. Name unit suites `*.spec.ts` and e2e suites `*.e2e.ts`. Target >90% coverage on schema modules, add regression tests for every bug, and archive tricky YAML in `tests/fixtures/`.

## Commit & Pull Request Guidelines
History is minimal, so adopt an imperative Conventional Commit style (e.g., `feat(schema): add rule conditions`, `fix(io): preserve anchors`). Keep subjects under 72 characters. Each PR should cite spec sections, summarize UX changes, attach screenshots or GIFs for UI shifts, and link the tracking issue. Include a verification checklist (lint, unit, e2e) and request schema plus UX reviews before merging significant changes.

## Architecture & Configuration Tips
Treat the Zod schema as the single source of truth; generate JSON schema, form metadata, and validation helpers directly from it. When editing YAML AST utilities, operate on `yaml.Document` nodes to preserve anchors and comments. Re-test keyboard paths in `@dnd-kit` after drag-and-drop changes, and document new MCP providers or presets in both the spec and tooltip copy.
