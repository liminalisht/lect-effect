Here’s a workable approach, given your insight about isolating service interfaces:

- Establish target packages:
  - `@lect-effect/services`: interfaces + simple types (no infra, no Effect runtime wiring, no DB/HTTP clients). Depends on `effect` and `@lect-effect/domain` (for domain models).
  - `@lect-effect/handlers`: HTTP/GraphQL/CLI handlers that depend on `effect`, `@lect-effect/domain`, and `@lect-effect/services` (interfaces), plus any handler-local helpers. No direct infra; concrete implementations stay in backend app.
- Migration order (minimize churn):
  1) Inventory service interfaces in `apps/backend/src/services/**` (e.g., appConfig, logger, repos, greeting, etc.). Separate interface/type exports from concrete implementations.
  2) Create `packages/services` workspace package (tsconfig, package.json, index barrel) exporting those interfaces/types. Keep dependencies lean: `effect`, `@lect-effect/domain`.
  3) Move interface files (or re-export) into `packages/services/src/**`. Adjust import paths in backend to use `@lect-effect/services`.
  4) Leave implementations in backend; update their imports to pull interfaces from `@lect-effect/services`.
  5) Create `packages/handlers` package with only handler code (e.g., HTTP/GraphQL resolvers/controllers). Depends on `effect`, `@lect-effect/domain`, `@lect-effect/services`. Move handler modules from backend into it; export via barrel.
  6) Update backend entrypoints to import handlers from `@lect-effect/handlers` and supply concrete service implementations when wiring the app (e.g., via layers/context).
  7) Update build/test/lint config (tsconfig paths, package.json workspace, pnpm, eslint/xo if needed).
  8) Run `.lect-effect.sh build` and `.lect-effect.sh test`.

- Why move interfaces first: it decouples infra from contracts, letting handlers target stable interfaces and making backend wiring the only coupling point to concrete services.

- Risks / edge cases:
  - Circular deps: ensure new packages only depend on domain + effect; avoid pulling in backend impls.
  - Types leaking: if interfaces currently live alongside impls with shared types, extract only what’s needed; create small shared DTOs in services or domain as appropriate.
  - Path aliases: update root tsconfig.json paths and per-package tsconfig references; adjust import paths in handlers/backend accordingly.
  - Packaging: ensure package.json exports field or simple `"main": "dist/index.js"`/types pointing to build outputs, consistent with existing workspace conventions.

If you want, I can draft the concrete package scaffolds (`packages/services` and `packages/handlers`), move interface files, and update imports incrementally.
