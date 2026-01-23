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

