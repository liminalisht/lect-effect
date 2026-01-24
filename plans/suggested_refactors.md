According to a document from January 23, 2026, here’s a codebase review with “principal engineer + functional programmer” bias: make boundaries *total*, make effects *explicit*, and make the FE↔BE contract a *checked morphism* (not a folklore convention).

---

## 1) Enforce the FE↔BE GraphQL contract (single biggest quality win)

### What I see

* The frontend issues GraphQL operations as raw strings (`helloQuery`, `createProductWithItemsMutation`) and then separately decodes the response via `effect/Schema`. That gives **runtime** safety, but **does not** ensure the *query* matches the backend schema at compile-time.
* Your `GraphQLClient.request` API is generic (`<A extends Record<string, Json>>`) but the type parameter isn’t tied to the query document in any way, so it can’t actually prevent mismatches.
* Several API interfaces accept `unknown` inputs (`HelloApi.greet(name: unknown)`, `ProductApi.createProductWithItems(input: unknown)`), which forces validation *somewhere*, but also propagates `unknown` farther than necessary.

### Actionable refactor (recommendation)

Treat the GraphQL schema as an *artifact* and typed operations as a *functor* from “operations” to “TS types”:

1. **Export the backend schema SDL as a build artifact**
   You already have the schema in-process and even log it with `printSchema(schema)`. Make this deterministic and file-based.

   Concretely:

   * Add a backend script (or small node entrypoint) that imports your schema builder and writes `schema.graphql` to a known path (or publishes it as a workspace package like `@lect-effect/graphql-schema`).
   * Run this in CI, and fail if the generated schema differs from what’s committed (or publish it during build).

2. **Add GraphQL Codegen (or equivalent) in the frontend**

   * Generate `TypedDocumentNode`s + variable/result types from:

     * the exported `schema.graphql`
     * `.graphql` operation documents (move your `/* GraphQL */` strings into `.graphql` files)

3. **Make raw string queries illegal**

   * Add `@graphql-eslint/eslint-plugin` to enforce:

     * operations validate against schema
     * no-unused-fragments, correct variable usage, etc.
   * Add a lint rule (or local convention) that GraphQL operations must come from generated modules, not ad-hoc strings.

4. **Update `GraphQLClient` to be typed by the operation**

   * Instead of `request<A>(doc: string, variables?: …): Effect<A,…>`, prefer:

     * `request<TData, TVars>(doc: TypedDocumentNode<TData, TVars>, vars: TVars): Effect<TData, …>`
   * You can still keep runtime decoding as a *belt-and-suspenders* check, but the compiler should now reject schema drift.

This directly addresses your example: “nothing guarantees the front end uses the right types/schemas when calling the backend.” Right now you validate *values*, not *the query-to-schema alignment*.

---

## 2) Make `createProductWithItems` atomic (transaction boundary)

### What I see

`createProductWithItems` does:

* create product
* for each item: create item + link row
  …but there is no transaction, so a mid-loop failure can leave partial writes (product created, some items created, some links missing).

### Actionable refactor

Introduce a *single* transactional morphism:

* Add a transaction combinator in the DB layer (e.g. `MasterdataDbService.transaction: Effect<A, E, R> -> Effect<A, E, R>`), or use the SQL client’s transaction API if present.
* Move the multi-step workflow into that transaction block:

Pseudo-shape (not exact API):

```ts
MasterdataDbService.transaction(
  Effect.gen(function* () {
    const product = yield* ProductRepoService.create(input.product);
    const items = yield* Effect.forEach(input.items, item =>
      Effect.gen(function* () {
        const created = yield* ItemRepoService.create(item);
        yield* ItemRepoService.linkToProduct(created.id, product.id);
        return created;
      })
    );
    return { product, items };
  })
)
```

### Tests to add (backend)

* A test that forces a failure on the second link (e.g. violate FK/unique, or inject a test repo that fails) and asserts **no** rows persist after rollback.

This is “hardening” in the strict sense: preserve invariants under partial failure.

---

## 3) Fix the N+1 query shape in GraphQL field resolvers

### What I see

Field resolvers look like:

* `itemsForProductField`: `itemRepo.listForProduct(input.id)`
* `productForItemField`: `productRepo.getForItem(input.id)`

That is an N+1 generator: querying `listProducts { items { … } }` can do 1 + N SQL calls.

### Actionable refactor

Use a batching layer (DataLoader pattern) in Yoga context:

* Add loaders to context: `itemsByProductId`, `productByItemId`
* Implement repo methods `listForProducts(productIds: readonly ProductId[])` and `getForItems(itemIds: readonly ItemId[])` (batch query with `WHERE id = ANY($1)`).

This reduces complexity and improves performance without changing your domain model.

---

## 4) Unify “absence” semantics: `Option` vs `null` (consistency + type safety)

### What I see

* `ProductRepo.getById` returns `Effect<Option<Product>>`
* `ItemRepo.getById` returns `Effect<Item | null>`

Then handlers sometimes convert `Option` to `null` (e.g. `Option.getOrNull`).

This is a small but pervasive complexity tax: two representations of partiality.

### Actionable refactor

Pick a single representation *inside the backend*:

* Prefer `Option` at the repo boundary (since you’re already using `effect`), and only convert to `null` at the GraphQL boundary (because GraphQL nullability is explicit).
* Or prefer `null` everywhere internally and drop `Option` from repos.

If you choose `Option`, change `ItemRepo.getById` to return `Effect<Option<Item>>` and make GraphQL handlers do the final `Option.getOrNull`.

Bonus: remove dead-ish error types. `ProductNotFound` exists, but `getById` returns `Option` (so it’s not currently the primary mechanism for “not found”).

---

## 5) Error algebra + naming cleanup (make errors a coproduct you can interpret)

### What I see

* Backend has `AppError` but it’s explicitly incomplete (“missing errors”) and doesn’t include repo error unions.
* Backend also defines `GraphqlError` as a union of server/runtime/context errors.
* Frontend defines `GraphqlError`, `HttpError`, `TransportError`, etc.

So the *same* name “GraphqlError” means fundamentally different things across FE and BE.

### Actionable refactor

1. **Rename for semantic clarity**

   * Backend: `GraphqlError` → `GraphQLServerError` (or `GraphQLContextError`)
   * Frontend: `GraphqlError` → `GraphQLResponseError` (i.e. “response contained `errors` array”)

2. **Make an explicit interpretation step at the GraphQL boundary**
   Right now `runEffect` is a natural transformation `Effect ~> Promise` that throws on failure.
   Instead, interpret your internal error coproduct into a `GraphQLError` with `extensions.code`:

   * validation errors → `BAD_USER_INPUT`
   * not found → `NOT_FOUND`
   * SQL errors → `INTERNAL_SERVER_ERROR` (and log cause)

3. **Frontend: decode GraphQL `errors` shape**
   `errors?: unknown` is too unstructured for UI rendering.
   Decode it to (at least) `{ message: string; path?: …; extensions?: … }[]` and surface a stable display model.

---

## 6) Frontend tests: you have a harness, but essentially no coverage

### What I see

There’s a single “sanity” test in `apps/frontend/src/app/app.spec.ts` with `expect(true).toBe(true)`.

### Actionable test plan (minimal-to-serious)

1. **Store tests (fast ROI)**

   * `HelloStore.run` should transition `RemoteData` correctly for success/failure. (You already structure it cleanly.)
   * `CreateProductStore.create` should set loading then success/failure; also remove `input: unknown` and make it typed.

2. **API layer tests**

   * Mock `GraphQLClientService` and assert `HelloApiLive.greet` decodes and maps errors correctly.
   * Same for `ProductApiLive.createProductWithItems`.

3. **Component tests**

   * `CreateProductFormComponent`: submitting with invalid pack size must not throw; currently it *can* throw (`packSize missing despite validation`). That’s exactly the kind of thing a component test catches.
   * Also consider property tests for form normalization (`'' → null`), since you already like property testing in `packages/domain/test`.

4. **E2E (optional but valuable)**

   * Playwright: “create product → see created product + items”.

---

## 7) Remove a sharp edge in the form: eliminate runtime `throw` under “validated” state

### What I see

`CreateProductFormComponent.submit()` throws if `draft.packSize.value()` is `null`, even though submission is gated on `canSubmit()` which checks `draft.packSize.isValid()`.

Even if this “should never happen”, it’s still a partial function inside UI code.

### Actionable refactor

Make the validated payload construction itself *total*:

* Either:

  * define a “validated draft” type and only construct it when valid, or
  * compute `Effect`/`Either` from the whole form (`Schema.decodeUnknownEither(createProductWithItemsInputSchema)`), then `submitted.emit(decoded)` only on `Right`.

At minimum: replace `throw` with an impossible branch that returns early and sets an error state, so UI never hard-crashes.

---

## 8) Resolve the snake_case vs camelCase split (project-wide naming consistency)

### What I see

* Domain `Item` schema uses `pack_size`.
* UI drafts use `packSize`, then map to `pack_size` at submit.
* GraphQL operations also use `pack_size`.

This is coherent, but it forces translation layers throughout TS/Angular code, which is friction.

### Actionable options (pick one and enforce)

1. **TS/Angular canonical: camelCase**

   * Domain objects: `packSize`
   * GraphQL: `packSize`
   * DB: `pack_size` (mapping only in repos)
   * Migration strategy: support both fields temporarily and deprecate one at the GraphQL layer.

2. **Full-stack canonical: snake_case**

   * Rename UI-facing signals/fields to `pack_size` to remove mapping.
   * (This is less idiomatic in TS, but internally consistent.)

Given your emphasis on “consistent naming and architecture,” this is worth deciding explicitly and documenting.

---

## 9) Harden servers (GraphQL + SSR Express)

### Backend GraphQL Yoga

Yoga is created with schema/context, but no obvious query depth/cost limiting or production safety knobs.

Action items:

* Add depth limit / query cost analysis plugin
* Disable introspection in prod
* Add request size limits, timeouts, and structured logging (request id → log correlation)
* Add CORS policy rather than default permissive behavior (depending on deployment)

### Frontend SSR Express

* No explicit Express error middleware is shown; errors are forwarded with `next(error)`.
* Documentation mismatch: comment says `PORT` env var, code reads `FRONTEND_PORT`.

Action items:

* Add `helmet`, `compression`, and a final error handler that renders a safe error page / logs details.
* Align env var naming and docs; pick `PORT` or `FRONTEND_PORT` and standardize.

---

## A consistent architectural rule set (write this down)

To keep developer comprehension high, I’d codify these invariants in docs:

1. **Domain schemas are the object classifier**: all external data crosses a `Schema.decodeUnknown` boundary.
2. **Repos are total wrt transport**: they return `Option` for absence, not thrown exceptions (or the other way—just one).
3. **GraphQL boundary interprets errors**: internal coproduct `E1 + E2 + …` → stable GraphQL error codes.
4. **Frontend operations are generated**: no raw GraphQL strings.

This turns “consistency across the project” into enforceable laws rather than taste.

---

-------


Below is a focused “Effect‑ecosystem” review: places where you can replace ad‑hoc impurity (shell scripts, implicit caching, implicit logging) with explicit, composable morphisms in the Kleisli category of `Effect`, so you can *pipe / reroute / bracket / observe* consistently across backend, frontend, and tooling.

I’m grouping suggestions by **effort** (XS/S/M/L) and **value** (DX/Correctness/Perf/Operability).

---

## XS effort, high value

### 1) Multi‑sink logging: console ⊗ file (and later → OTEL)

**Observed:** your backend logger layer only sets minimum log level; it doesn’t give you a “tee” to disk or structured routing.

**Effect move:** use `@effect/platform`’s `PlatformLogger` for file logging, and compose with the existing logger (categorically: a product of log algebras).

* `PlatformLogger.toFile(...)` gives you a logger backed by a file descriptor.
* Then combine/zip loggers (or replace the default with a composite).

**Actionable steps**

1. Add a config for log file path (e.g. `LOG_FILE=var/log/app.log`).
2. In `apps/backend/src/services/logger/layer.ts`, build a composite logger:

   * current: `Logger.replace(Logger.defaultLogger, Logger.minimumLogLevel(logLevel))`
   * target: `Logger.replace(Logger.defaultLogger, Logger.minimumLogLevel(logLevel) |> (consoleLogger ⊗ fileLogger))`
3. Ensure file logger is in a `scoped` resource so rotation/close is guaranteed.

**Why it matters**

* Immediately enables: “run tests → capture logs to file → link from docs” without inventing more shell plumbing.
* Becomes the same output substrate you later export to OTEL.

---

### 2) Replace bespoke top‑level runners with `NodeRuntime.runMain`

**Observed:** you already have a clean `Effect.acquireRelease` server lifecycle in `createServer`.

**Effect move:** standardize *every* “main” entrypoint (backend server, tooling commands) through `NodeRuntime.runMain`, which gives consistent fatal error handling + exit codes + fiber supervision.

**Actionable steps**

* In the backend `main` (where you currently run the server effect), do:

  * `pipe(createServer, Effect.provide(AppLayer), NodeRuntime.runMain)`
* Do the same for the future tooling CLI (see below).

This gives one uniform notion of “main program” across the repo.

---

### 3) Apply bounded retries + timeouts at boundaries

**Observed:** DB access is already isolated behind repos; the repo methods are the canonical boundary. E.g. `ItemRepoService.listForProduct` ultimately runs SQL and decodes.

**Effect move:** wrap *only boundary effects* with `timeout` + `retry` schedules (so you don’t accidentally retry pure logic).

* `Effect.retry` + `Schedule` is the standard algebra here.

**Actionable steps**

1. Define a small utility:

   * `withDbResilience: Effect<A,E,R> -> Effect<A,E | TimeoutError,R>` that:

     * times out (e.g. 2–5s per query)
     * retries on **transient** `SqlError`/network errors (exponential + jitter + max recurs)
2. Apply it inside repo implementations (`apps/backend/src/services/*Repo/implementation.ts`), *not* in handlers/resolvers.

Value: correctness under partial failure + predictable latency tails.

---

## S effort, high value

### 4) Turn your bash orchestration into an Effect pipeline (Command ⟶ Stream ⟶ FileSystem)

**Observed:** `scripts/tests.sh` / `scripts/docs.sh` / `scripts/start.sh` are imperative bash pipelines with implicit IO routing. E.g. `tests.sh` runs install/build/test; `docs.sh` runs tests then docgen.

**Effect move:** model these as an explicit *tooling program* using:

* `@effect/platform/Command` to run external processes.
* `@effect/platform/FileSystem` to write artifacts deterministically.
* `Stream` to tee stdout/stderr to `(console ⊗ file)` (your “pipe and reroute effects” desire).

**Concrete plan (minimal)**

1. Create `tools/cli` (or `packages/tooling`) with a `main.ts` using `NodeRuntime.runMain`.
2. Implement commands:

   * `tool test`  (runs pnpm tests)
   * `tool docs`  (runs test + docgen)
   * `tool ci`    (install + build + test + docs)
3. For each command:

   * execute `Command.make("pnpm", …)`
   * stream output:

     * to console *and*
     * to `artifacts/<cmd>.log` via `FileSystem` + `PlatformLogger.toFile` (or raw stream sinks)

**Why this is a big deal**

* You get a *single* abstract interface for “run a step, capture output, publish to docs”.
* You can add phases as ordinary composition: `phase1 >=> phase2 >=> phase3` (Kleisli composition), rather than nested bash.

---

### 5) Adopt `@effect/cli` for consistent, typed tooling UX

Once you build the tooling program above, use `@effect/cli` to make it discoverable and consistent (help text, args/options parsing, subcommands).

This is low effort once you already have `Command`/`FileSystem` in place, and it locks in a consistent “one tool” interface for devs.

---

## M effort, very high value

### 6) Kill GraphQL N+1 with Effect Request batching/caching

**Observed (clear N+1 surfaces):**

* `Product.items` field resolves by calling `itemRepo.listForProduct(product.id)` per product.
* `Item.product` field resolves by calling `productRepo.getForItem(item.id)` per item.

In a list query, that’s classic N+1 behavior.

**Effect move:** represent “fetch items by productId” and “fetch product by itemId” as *requests* and interpret them with a batched resolver.
Effect has built‑in request batching controls (e.g. `Effect.forEach(..., { batching: true })`), and explicit toggles via `withRequestBatching`.

**Actionable steps**

1. Extend repos with batched queries:

   * `ItemRepoService.listForProducts(productIds: ReadonlyArray<ProductId>) -> Effect<Record<ProductId, Item[]>, DbError>`
   * `ProductRepoService.getForItems(itemIds: ReadonlyArray<ItemId>) -> Effect<Record<ItemId, Option<Product>>, DbError>`
     This is a pure SQL improvement; you already have joins in the single‑key versions.
2. Implement request batching:

   * a request type `ItemsByProductId(productId)` interpreted by a batched resolver calling `listForProducts`.
   * similarly `ProductByItemId(itemId)` calling `getForItems`.
3. Ensure **per GraphQL request** shared cache/batching context:

   * today each resolver runs `runtime.runPromise` in isolation.
   * you want the “request cache” object to be a shared comonadic environment for the whole GraphQL execution, not per field.

**Outcome**

* Asymptotic improvement: `O(n)` DB round‑trips → `O(1)` (per field group).
* Cleaner semantics: field resolvers become *declarative requests*, not “do SQL now”.

---

### 7) Add transactions for multi‑step mutations (`createProductWithItems`)

**Observed:** `createProductWithItemsMutation` creates a product, then loops and creates items + links. A mid‑loop failure leaves partial state.

**Effect move:** bracket the entire mutation in a DB transaction using `SqlClient.withTransaction`. The `SqlClient` API exposes `withTransaction(self: Effect<…>)`. ([Effect TS][1])

**Actionable steps**

1. In your `MasterdataDbService` or `SqlClient` service layer, expose `withTransaction`.
2. Wrap the handler effect:

   * `sql.withTransaction(createProduct *> createItems *> linkItems)`
3. Decide concurrency inside the transaction:

   * sequential (safer) or bounded parallel with `Effect.forEach(..., { concurrency: k })`.

Value: correctness (atomicity) + simpler retry semantics (you can retry the whole tx on serialization errors).

---

### 8) OpenTelemetry end‑to‑end: GraphQL request spans + SQL spans + log correlation

**Observed:** no OTEL packages/layers are present in the backend dependencies snippet.

**Effect move:** add OTEL via `@effect/opentelemetry` + Node SDK layer. The docs show a `NodeSdk.layer(() => ({ resource: { serviceName: … } }))`.

**Actionable steps**

1. Add OTEL layers:

   * Node SDK layer (service name, exporter, sampler)
2. Wrap GraphQL execution:

   * create a span per operation (name = operationName or fallback)
   * annotate with `requestId`, `userId`, query hash, etc.
3. Wrap repo methods with spans (or use automatic instrumentation where available).
4. Correlate logs:

   * inject trace/span ids into log annotations (fiber refs) so file logs and OTEL traces line up.

Value: production‑grade debugging (latency attribution + error provenance) with minimal future regret.

---

## L effort, high value

### 9) Converge on Effect Platform for the HTTP edge (optional, but unifies everything)

You currently embed Effect into Express/GraphQL Yoga by passing a runtime into the context.

A deeper unification is to make the HTTP edge itself an Effect program (Platform Http server), so:

* middleware becomes `Effect<Request, Response>`
* lifecycle, telemetry, logging, and shutdown are *one* bracketing story

This is a bigger migration, but it yields maximal consistency: one algebra for resources everywhere.

---

## A “roadmap” that preserves consistency

Here is a sequencing that minimizes architectural divergence:

1. **Logging tee + NodeRuntime.runMain** (XS)
2. **Tooling CLI (Command/FileSystem/Stream) replacing bash** (S)
3. **Retries/timeouts at repo + client boundaries** (S)
4. **GraphQL N+1 batching** (M)
5. **Transactions for multi‑step mutations** (M)
6. **OTEL** (M)
7. **(Optional) Effect Platform HTTP edge** (L)

This keeps a single guiding invariant:

> every side effect factors through a named, testable algebra (Service), with a small number of interpreters (Layers), and observable semantics (logs/traces) as a natural transformation over the whole program.

---

## If you want one concrete “first PR” to prove the thesis

Make a single PR that:

1. Adds `tool ci` implemented via `Command` + `FileSystem` (capture logs to `artifacts/ci.log`).
2. Updates backend logger layer to tee logs to console + file.
3. Switches backend main to `NodeRuntime.runMain`.

That single move gives you the “pipe/reroute effects” capability immediately, and establishes the repo‑wide pattern for the next steps (batching + OTEL).

[1]: https://effect-ts.github.io/effect/sql/SqlClient.ts.html "https://effect-ts.github.io/effect/sql/SqlClient.ts.html"
