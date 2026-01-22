Yes — I would do both, *provided you’re still early enough that a one-time refactor is cheap*.

* Putting the backend in `apps/backend` and the Angular app in `apps/frontend` makes the repo’s *dependency graph* reflect a useful **factorization**:

  * `packages/**` = “library objects” (domain, mostly pure / referentially transparent)
  * `apps/**` = “executable boundary objects” (effects, I/O, deployment concerns)
* That aligns with the “one Kleisli boundary” instinct: effectful edges concentrate at app boundaries; libraries remain testable and reusable.

Your current root already behaves like an *orchestrator* (it proxies into `packages/domain` and `apps/web` via scripts), so we can refactor while preserving your public commands (`pnpm run lect-effect/run`, `./run.sh`, etc.). Evidence: root scripts already proxy frontend calls through `pnpm -C apps/web …` and compose backend+frontend with `concurrently`.

Below are the concrete checklists.

---

## A. Rename `apps/web` → `apps/frontend`

### A1. Minimal rename (folder only; keep Angular project name `web`)

This is the smallest “commuting diagram” change: only the *path* changes; the Angular project identity may remain `web`.

#### Filesystem move

* [ ] `git mv apps/web apps/frontend`

#### Update root scripts that hardcode `apps/web`

Your root `package.json` currently proxies frontend scripts via `pnpm -C apps/web …`.

* [ ] In root `package.json`, replace every `pnpm -C apps/web` with `pnpm -C apps/frontend` for the **frontend proxy scripts**, e.g.:

  * `lect-effect/frontend/clean`
  * `lect-effect/frontend/build`
  * `lect-effect/frontend/test`
  * `lect-effect/frontend/start`
  * `lect-effect/frontend/watch`
  * `lect-effect/frontend/serve:ssr`
  * `lect-effect/frontend/docs:generate`
  * `lect-effect/frontend/clean:build`
  * `lect-effect/frontend/clean:build:test`
  * `lect-effect/frontend/clean:build:test:start`
  * `lect-effect/frontend/install`
  * `lect-effect/frontend/install:nofreeze`
    (These are explicitly present now.)

* [ ] Update the concurrent “run both” scripts:

  * `lect-effect/run`: currently runs `"pnpm -C apps/web run lect-effect/frontend/start"`
  * `lect-effect/run:with-docs`: same issue

#### Update the frontend package’s self-install scripts

Your `apps/web/package.json` contains scripts that refer to `./apps/web` explicitly (filters).

* [ ] In `apps/frontend/package.json` (after the rename), update:

  * `_install`: `--filter ./apps/web` → `--filter ./apps/frontend`
  * `_install:nofreeze`: same replacement

#### Update any repo scripts that mention `apps/web`

You have shell wrappers that call the *script names* (`pnpm lect-effect/frontend/start`, etc.), which is good: they don’t mention the directory directly.
So **they should keep working** as long as the root proxy script keeps the same name.

Still, do the mechanical search:

* [ ] `git grep -n "apps/web"` and replace occurrences with `apps/frontend`

  * Root `package.json` will be the main hit.
  * Frontend `package.json` `_install` scripts are another hit.

#### Proof obligations

* [ ] `pnpm install`
* [ ] `pnpm lect-effect/frontend/start` (should now run from `apps/frontend`, but via root proxy)
* [ ] `pnpm run lect-effect/run` (backend + frontend)

### A2. Full rename (folder + Angular project name)

Only do this if you want the output folders to say `dist/frontend` instead of `dist/web`.

Additional steps (on top of A1):

* [ ] In `apps/frontend/angular.json`, rename the project key `web` → `frontend`, and update any `outputPath` / builder references.
* [ ] Update `apps/frontend/package.json` where you run SSR:

  * currently `_serve:ssr` runs `node dist/web/server/server.mjs`
  * after renaming the Angular project output, that typically becomes `dist/frontend/server/server.mjs` (depending on your `outputPath`).

This is more churn, so I’d only do it if “`web`” as an identity is actively annoying.

---

## B. Move backend from repo root → `apps/backend`

Here the goal is: root becomes a *workspace orchestrator object*; backend becomes an *app object* in `apps/backend`. We preserve the existing **public script interface** (`lect-effect/backend/*`) by turning those root scripts into *proxies*, just like you already do for `domain` and `frontend`.

### B1. Create the backend app directory and move code

* [ ] `mkdir -p apps/backend`
* [ ] Move the backend source tree:

  * [ ] `git mv src apps/backend/src`
* [ ] Move the backend tests:

  * [ ] `git mv test apps/backend/test`
* [ ] Decide about migrations:

  * **Minimal churn option (recommended now):** keep `migrations/**` at root so your existing migration scripts still work unchanged (`-m migrations/masterdatadb`). Those scripts currently live in the root `package.json`.
  * **More “pure” containment option:** `git mv migrations apps/backend/migrations` and then update the root migration scripts accordingly (see B4).

### B2. Add `apps/backend/package.json`

Create a new `apps/backend/package.json` by **extracting** the backend concerns from the current root `package.json`.

Facts about current root backend scripts you’ll be migrating:

* Backend “private” scripts are `_clean`, `_build`, `_test`, `_start`, `_docs`, etc.
* Backend public scripts are `lect-effect/backend/*` pointing at those `_…` scripts.
* Backend start currently runs `node dist/src/index.js` after `tsc`.
* Backend docs generation uses `docgen --project tsconfig.json --src ./src/ --out ./docs/src/content/docs/backend/ …`.

**Checklist:**

* [ ] Create `apps/backend/package.json` with:

  * [ ] `"type": "module"` (ESM)
  * [ ] dependencies/devDependencies that backend actually needs (the ones currently in root)
  * [ ] scripts: copy the backend scripts (`_clean`, `_build`, … and `lect-effect/backend/*`)
* [ ] Adjust backend docs output path (because backend is no longer at repo root):

  * [ ] change `_docs` output from `./docs/src/content/docs/backend/` to `../../docs/src/content/docs/backend/` (relative from `apps/backend`)
    (Or keep docs generation orchestrated from root; both are fine, but **don’t** leave a broken relative path.)

### B3. Add `apps/backend/tsconfig.json` and `apps/backend/tsconfig.test.json`

Your current root `tsconfig.json` is Node24-based and includes path mapping for `@lect-effect/domain` to `./packages/domain/src/*`.

**Minimal approach:** keep root `tsconfig.json` as a “base”, and have backend extend it.

* [ ] Create `apps/backend/tsconfig.json`:

  * [ ] `"extends": "../../tsconfig.json"`
  * [ ] `"compilerOptions": { "outDir": "dist" }`
  * [ ] `"include": ["src", "test"]`
* [ ] Create `apps/backend/tsconfig.test.json` similarly:

  * [ ] `"extends": "./tsconfig.json"`
  * [ ] `"compilerOptions": { "noEmit": true }`
  * [ ] `"include": ["src/**/*", "test/**/*"]`

This keeps the *type-level* dependency on the shared domain consistent (you already have TS paths for it in the base config).

### B4. Refactor root `package.json` into a pure orchestrator

Right now root `package.json` *is* the backend: it runs `tsc` and starts `dist/src/index.js`, and it defines `lect-effect/backend/*` directly.

After moving backend, root should instead proxy backend scripts just like it proxies domain and frontend.

#### Convert root backend scripts into proxies

* [ ] Replace root definitions of:

  * `_clean`, `_build`, `_test`, `_start`, `_docs` (these should move into `apps/backend`)
  * `lect-effect/backend/*` (these should become `pnpm -C apps/backend run lect-effect/backend/...`)
* [ ] Example rewrite pattern:

  * Before: `"lect-effect/backend/build": "pnpm run _build"`
  * After:  `"lect-effect/backend/build": "pnpm -C apps/backend run lect-effect/backend/build"`

#### Keep top-level convenience scripts stable

Your shell scripts (`run.backend.sh`, `run.sh`, etc.) call the stable public script names (`pnpm lect-effect/backend/start`, `pnpm run lect-effect/run`, …).

So preserve these names by proxying; then:

* [ ] `./run.backend.sh` should continue to work unchanged
* [ ] `./run.sh` should continue to work unchanged

#### Migrations decision point

If you **keep** `migrations/**` at root:

* [ ] No change needed to:

  * `migrate:masterdata:up`
  * `migrate:test-masterdata:up`

If you **move** `migrations/**` into `apps/backend/migrations`:

* [ ] Update root migration scripts:

  * `-m migrations/masterdatadb` → `-m apps/backend/migrations/masterdatadb`
* [ ] Consider moving `.env` files too, or keep them at root (your migration scripts currently reference `.env` at root).

### B5. Update any hardcoded references to backend build output

If anything (Dockerfiles, deploy scripts) refers to `dist/src/index.js` at repo root, it must be updated once backend compiles into `apps/backend/dist/**`.

Within root scripts, the current start is literally `node dist/src/index.js`, so after the refactor:

* [ ] root `start` should become a proxy (recommended), not a direct `node …`:

  * `start`: `pnpm run lect-effect/backend/start`

### B6. Proof obligations (backend move)

* [ ] `pnpm install`
* [ ] `pnpm lect-effect/domain/build`
* [ ] `pnpm lect-effect/backend/build`
* [ ] `pnpm lect-effect/backend/test`
* [ ] `pnpm run lect-effect/run` (backend+frontend concurrently)

---

## C. Do you need to amend `pnpm-workspace.yaml`?

If (as the plan states) your workspace file includes `"apps/*"` and `"packages/*"`, then:

* renaming `apps/web → apps/frontend` needs **no** workspace change (still matches `apps/*`)
* adding `apps/backend` needs **no** workspace change (also matches `apps/*`)

So: **probably no**, unless your workspace file enumerates `apps/web` explicitly (then you’d update it).

---

## D. Recommendation on ordering (minimize breakage)

1. **Rename** `apps/web → apps/frontend` (small surface area).
2. Turn root frontend proxies to point at `apps/frontend`.
3. Only then **move backend** into `apps/backend`, keeping root script *names* stable by proxying.

This keeps your existing “user-facing” commands (`pnpm lect-effect/run`, `./run.sh`, etc.) as *stable morphisms* while you change only the internal factorization.
