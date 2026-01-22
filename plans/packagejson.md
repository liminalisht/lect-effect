Here’s a concrete, repo-wide scripting plan that fits your conventions (public “lect-effect/.../...” entries call into package-local public scripts via `pnpm -C <path> run <public>`, and locals keep private “atomic” helpers). No edits applied yet.

## Proposed Structure

### Naming
- Public scripts (invoked from elsewhere): `lect-effect/<area>/<action>`
- Private atomics (only called inside that package): `_clean`, `_build`, `_test`, `_lint`, `_start`, `_docs`, etc.
- Each package’s public script simply delegates to its atomic in the same package (no cross-calls).
- Root public scripts delegate to the package public scripts using `pnpm -C <path> run lect-effect/<area>/<action>`.

### Frontend (apps/frontend/package.json)
Atomics (private):
- `_clean`: `rm -rf dist .angular/cache`
- `_build`: `ng build`
- `_test`: `ng test`
- `_start`: `ng serve --proxy-config proxy.conf.json`
- `_watch`: `ng build --watch --configuration development`
- `_serve:ssr`: `node dist/frontend/server/server.mjs`

Public:
- `lect-effect/frontend/clean`: `pnpm run _clean`
- `lect-effect/frontend/build`: `pnpm run _build`
- `lect-effect/frontend/test`: `pnpm run _test`
- `lect-effect/frontend/start`: `pnpm run _start`
- `lect-effect/frontend/watch`: `pnpm run _watch`
- `lect-effect/frontend/serve:ssr`: `pnpm run _serve:ssr`
- Optionally bundles:
  - `lect-effect/frontend/clean:build`: `_clean && _build`
  - `lect-effect/frontend/clean:build:test`: `_clean && _build && _test`
  - `lect-effect/frontend/clean:build:test:start`: `_clean && _build && _test && _start`

### Domain (packages/domain/package.json)
Atomics:
- `_clean`: `rm -rf dist`
- `_build`: `tsc -p tsconfig.json`
- `_test`: `vitest run --dir test`
- `_docs`: `docgen --project tsconfig.json --src ./src/ --out ../../docs/src/content/docs/domain/ --exclude "**/test/**"`

Public:
- `lect-effect/domain/clean`: `pnpm run _clean`
- `lect-effect/domain/build`: `pnpm run _build`
- `lect-effect/domain/test`: `pnpm run _test`
- `lect-effect/domain/docs:generate`: `pnpm run _docs`
- Bundles: `lect-effect/domain/clean:build`, `clean:build:test`

### Backend (root src/*)
Atomics (root package.json operates as backend):
- `_clean`: `rm -rf dist`
- `_build`: `tsc` (after domain built)
- `_test`: `pnpm run typecheck:test && env-cmd -f .env.test --no-override vitest run --no-file-parallelism`
- `_start`: `pnpm run _build && node dist/src/index.js`
- `_docs`: existing docgen for app `docs:generate:app`

Public:
- `lect-effect/backend/clean`: `pnpm run _clean`
- `lect-effect/backend/build`: `pnpm run _build`
- `lect-effect/backend/test`: `pnpm run _test`
- `lect-effect/backend/start`: `pnpm run _start`
- `lect-effect/backend/docs:generate`: `pnpm run _docs`
- Bundles: `lect-effect/backend/clean:build`, `clean:build:test`, `clean:build:test:start`

### Root Orchestration (package.json)
Root public scripts call package-level public scripts with `pnpm -C ... run ...`:
- `lect-effect/clean`: runs `frontend/clean`, `domain/clean`, `backend/clean` (in order).
- `lect-effect/build`: runs `domain/build` then `backend/build` then `frontend/build` (order: libraries → backend → frontend).
- `lect-effect/test`: runs `domain/test`, `backend/test`, `frontend/test`.
- `lect-effect/lint`: existing `lint` (xo) suffices.
- `lect-effect/docs:generate`: runs `backend/docs:generate` and `domain/docs:generate`.
- Convenience bundles: `lect-effect/clean:build`, `lect-effect/clean:build:test`, `lect-effect/clean:build:test:start` (start optional if you want dev server).

Each root script uses the public interface of subpackages, e.g.:
- `pnpm -C packages/domain run lect-effect/domain/build`
- `pnpm -C apps/frontend run lect-effect/frontend/build`
- Local backend public `lect-effect/backend/build` inside root.

### Docs package (docs/package.json)
If you want consistency:
Atomics:
- `_clean`: `rm -rf dist .astro`
- `_dev`: `astro dev`
- `_build`: `astro build`
- `_preview`: `astro preview`

Public:
- `lect-effect/docs/clean`: `_clean`
- `lect-effect/docs/dev`: `_dev`
- `lect-effect/docs/build`: `_build`
- `lect-effect/docs/preview`: `_preview`

Root can optionally add `lect-effect/docs/build` passthrough: `pnpm -C docs run lect-effect/docs/build`.

## Rollout Steps
1) Update package.json scripts to the atomic/public pattern above; remove old lect-effect/apps/frontend/* aliases.
2) Update package.json similarly; remove old lect-effect/packages/domain/* aliases.
3) Add root backend atomics/public; replace old lect-effect/* aliases with the new layout.
4) Add root orchestration scripts that only call public subpackage scripts via `pnpm -C <path> run lect-effect.`.
5) (Optional) Apply pattern to docs package; add root passthrough if desired.
6) Re-run `pnpm install` not required (no new deps).
7) Verify with lint.sh, `pnpm clean`, `pnpm run lect-effect/clean:build`, etc.

If you’re good with this plan, I’ll implement it in all package.json files and keep the commands sorted and minimal.
