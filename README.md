# Continue Dev Hub Configuration Wizard

Schema-driven authoring tool for Continue Dev Hub `config.yaml` files. Built with Next.js 15, React Hook Form, and a Zod schema that acts as the single source of truth for validation, UI metadata, and JSON schema generation.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 to launch the wizard with live YAML preview.

## Scripts

- `pnpm dev` – Next.js development server with hot reload.
- `pnpm build` – Type-check, regenerate `public/schema/config.schema.json`, and produce the production bundle.
- `pnpm start` – Run the production build.
- `pnpm lint` – ESLint (strict TypeScript rules, Next.js plugin).
- `pnpm test` – Vitest unit suites (schema, YAML helpers, store, form transformers).
- `pnpm test:e2e` – Placeholder Playwright smoke test scaffold.

## Project Structure

```
src/
  app/               # Next.js App Router entry points
  components/        # UI primitives and wizard surfaces
  lib/               # Schema-driven form metadata, YAML helpers, validation
  schema/            # Zod config schema (single source of truth)
  store/             # Zustand store for shared wizard state
public/schema/       # Generated JSON schema (pnpm build/gen:schema)
scripts/             # Build-time utilities
tests/               # YAML fixtures for unit suites
```

Refer to `spec_1_continue_dev_hub_configuration_wizard.md` for the product brief and backlog priorities.

## Highlights

- **Form + Block parity** foundations: schema-derived form sections, array controls for models/context/rules/prompts/docs/MCP/data, and Monaco-powered YAML preview stay in sync via the Zod schema.
- **Validation**: AJV compiled from the Zod schema ensures runtime feedback, while React Hook Form enforces typed inputs.
- **YAML fidelity**: `yaml` Document AST helpers preserve anchors so round-tripping import/export remains lossless.

## Roadmap

- Flesh out block mode (drag-and-drop canvas) and presets/snippets.
- Surface doc links and warning panels for deprecated/unknown keys.
- Expand Playwright E2E coverage for create/import/edit/export flows.
