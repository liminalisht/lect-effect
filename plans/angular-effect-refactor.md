You’re basically noticing that the backend has a *single* semantic story:

> **unknown boundary data** → **Schema decode** → **Effect programs** with an explicit **environment** → interpreted by a **runtime** built from **Layers** (config/logger/etc.).

Whereas the frontend currently has the same ingredients, but they’re not yet assembled into a *single commuting diagram*.

Below is a refactor proposal that makes the frontend match the backend **up to the constraints of Angular**, i.e. we make the frontend as close as possible to the same “Kleisli category of Effect” architecture, while accepting that Angular owns rendering + DI of components.

---

## 0. What you already have that’s *good*

### Zoneless + OnPush baseline is correct

Your browser bootstrap explicitly enables zoneless and global error listeners: `provideBrowserGlobalErrorListeners()` + `provideZonelessChangeDetection()` in `apps/frontend/src/app/app.config.ts`.

That establishes a clean “explicit reactivity” baseline and avoids Zone-driven spooky action at a distance.

### You already have an Effect edge and a runtime bridge

You have:

* `GraphQLClient` as an Effect service with a Live layer built on `fetch` (good: *single impurity point*).
* `UiRuntime` as a `ManagedRuntime` wrapper used by stores to interpret effects (good: the UI does not “run effects everywhere”).

This already matches your stated “only stores run effects” discipline.

### Your feature slices already validate via shared Schemas (at least for Hello and Product)

Your product API decodes both variables and response via shared domain Schemas (good).

So the “boundary = Schema decode” idea is already present.

---

## 1. Where the frontend currently diverges from the backend

### (A) Runtime layer is too thin (no config, no logger)

`UiRuntime` currently builds `AppLayer` as just `GraphQLClientLive('/graphql')`.

Backend, by contrast, composes layers like config and logger (e.g. `loggerLayer` depends on `AppConfigService` and sets minimum log level).

### (B) Tags and service shape differ (GenericTag vs Tag-class, and missing domain services)

Frontend: `GraphQLClientTag = Context.GenericTag<GraphQLClient>(...)`.

Backend: services are typically `class X extends Context.Tag("...")<...>() {}` (nominal tag + consistent interface/impl/layer split). For example `ItemRepoService` is a Tag-class with a corresponding `ItemRepoServiceLive` layer.

Frontend also lacks *domain* services as first-class Effect services: you have a `GraphQLClient`, but “Hello API”, “Product API” are just functions, not tagged services/layers.

### (C) Store error typing collapses to `unknown`

Your stores often keep `RemoteData<unknown, A>` and store `exit.cause` into `unknown`:

* `HelloStore`: `signal<RemoteData<unknown, HelloResponse>>` and `remoteData.failure(exit.cause)`.
* `CreateProductStore`: `RemoteData<unknown, ProductWithItems>` and `remoteData.failure(exit.cause)`.
* `ToyStore` even has a redundant try/catch around `runExit` and then stores `exit.cause` as `unknown`.

This loses the whole point of your tagged error coproduct (you *already* have typed errors at the GraphQL edge).

### (D) Page vs component separation is *mostly* already there, but inconsistent across features

`CreateProductPage` is a clear container component that provides the store (`providers: [CreateProductStore]`).

But `HelloStore` is `providedIn: 'root'`, so `HelloPage` is less “slice-local” than your product feature slice.

---

## 2. Refactor target: make frontend match backend *up to Angular’s laws*

Think of two “dependency categories”:

1. **Angular DI category**: objects are Angular providers; morphisms are constructor injection. Angular owns component lifecycle, rendering, routing, SSR concerns.
2. **Effect environment category**: objects are services (Tags); morphisms are Layers; programs live in the Kleisli category `R ⟶ Effect<E, A>`.

Your goal is to keep a **single natural transformation**:

> `interpret : Effect<R, E, A> → Promise<Exit<E, A>>`

implemented by `UiRuntime`, and ensure the *entire* effect environment `R` is provided by a single composed `AppLayer`, just like the backend.

Angular’s paradigms trump Effect’s here:

* **Components are not Effects**. Don’t try to “Layer-provide” components; keep components pure-ish functions of Signals and Inputs.
* **Angular DI is the outer container**; Effect’s Context is the inner container used to interpret I/O and validation programs.
* Angular already provides a global error boundary (`provideBrowserGlobalErrorListeners`). Use it as your last-resort boundary, while keeping “expected failures” typed inside Effect.

---

## 3. Concrete refactors (minimal code, maximal alignment)

### Refactor 1: Introduce a *frontend AppConfig service* (Effect Tag + Layer), sourced from Angular DI

Backend pattern (config service + schema + layer) is very explicit.

Frontend analogue:

* Create: `apps/frontend/src/app/core/config/frontend-config.ts`

  * `FrontendConfig` Schema (endpoint, log level, maybe “mode”)
  * `class FrontendConfigService extends Context.Tag(...)<...>() {}` (match backend style)
  * `FrontendConfigLive` layer that *succeeds* with decoded config

**Angular-specific bridge:** config values come from Angular’s world (environment files, SSR server, etc.). So provide a raw config object via an Angular `InjectionToken`, then decode it *once* when constructing the layer.

Why this is best:

* You get **backend-like explicitness** (schema, tag, layer).
* You avoid “process.env” fantasies in the browser.
* You can supply different config in `app.config.ts` vs `app.config.server.ts` (SSR) without changing Effect code.

### Refactor 2: Add an Effect logger layer and route it through the runtime

Backend does:

* `loggerLayer = Layer.effect(AppConfigService, appConfig => Logger.minimumLogLevel(appConfig.logLevel))`

Frontend should do the same, with `FrontendConfigService`:

* Create: `apps/frontend/src/app/core/logging/logger.layer.ts`
* Provide it in `AppLayer` so anything can call `Effect.log*` consistently.

This is “cheap” alignment: it’s small, and it removes the inconsistency you noticed.

### Refactor 3: Switch `Context.GenericTag` → Tag-class style for consistency

Right now:

* `GraphQLClientTag = Context.GenericTag<GraphQLClient>(...)`.

Backend’s style is Tag classes (example: `ItemRepoService`).

Switching is mostly *structural aesthetics*, but it has real benefits:

* Uniform import idioms across repo.
* Uniform “interface/implementation/layer” conventions.

Do this for:

* `GraphQLClient`
* `FrontendConfigService`
* `HelloApiService`
* `ProductApiService`

### Refactor 4: Promote “API modules” into domain-specific Effect services

Right now you have functions like `createProductWithItems(unknown)` (which is fine), but the store depends directly on that function and (implicitly) on `GraphQLClient`.

Instead, factor it like the backend:

* `apps/frontend/src/app/api/product/product.api.service.ts` (Tag-class interface)
* `apps/frontend/src/app/api/product/product.api.live.ts` (implementation in terms of `GraphQLClient`)
* `apps/frontend/src/app/api/product/product.api.layer.ts` (Layer provider)

Same for hello.

**Resulting dependency chain becomes strictly linear and mockable:**

`component → store → ProductApiService → GraphQLClient → fetch`

(You already *wanted* this; it’s exactly the “domain service layer” you said is missing.)

This also makes testing trivial: provide a test `ProductApiService` Layer that returns canned values, without even mocking `fetch`.

### Refactor 5: Fix store error types: stop erasing to `unknown`

Your `RemoteData` is already parameterized: `RemoteData<E, A>`.

So use it.

Two good options:

#### Option 5.1 (honest): store `Cause<Cause<E>>`

Stores currently shove `exit.cause` into `unknown` anyway.

Make that explicit:

* `RemoteData<Cause.Cause<HelloError>, HelloResponse>`
* `RemoteData<Cause.Cause<CreateProductError>, ProductWithItems>`

Then your result component can render `Cause.pretty(cause)` instead of `JSON.stringify(unknown)`.

#### Option 5.2 (simpler UI): squash to a tagged domain error

If you want fewer UI cases, define a “UI error coproduct” (e.g. `NetworkError | ValidationError | UnexpectedDefect`) and map `Cause` into it once.

Either way: *don’t throw away information* by using `unknown`.

### Refactor 6: Make stores slice-local (page provides store) consistently

You already do the right thing in `CreateProductPage` (`providers: [CreateProductStore]`).

Do the same for hello:

* remove `providedIn: 'root'` from `HelloStore`
* add `providers: [HelloStore]` to `HelloPage`

Why:

* It makes feature slices behave like *products* in a coproduct: each route gets its own slice state unless you explicitly choose otherwise.
* It keeps tests clean: instantiate page → you get a fresh store.

### Refactor 7: Widen `UiRuntime.runExit` to the actual `AppEnv`

Right now it is pinned to `GraphQLClient` as the environment constraint:

```ts
runExit<A, E>(effect: Effect.Effect<A, E, GraphQLClient>): Promise<Exit.Exit<A, E>>
```

Once you add config/logger/domain services, the environment is not just `GraphQLClient`.

Define:

* `type AppEnv = GraphQLClient | FrontendConfigService | HelloApiService | ProductApiService | ...`
* `runExit<A, E, R extends AppEnv>(effect: Effect.Effect<A, E, R>): ...`

This is exactly the move from “runtime interprets one service” to “runtime interprets the whole app algebra”, matching the backend’s composition style.

---

## 4. Where Angular should “win” (i.e. don’t force Effect everywhere)

1. **Rendering, change detection, and template reactivity stay Angular-native**
   Signals/Inputs/Models are Angular’s semantic layer. Don’t reimplement “signal propagation” using fibers.

2. **Component lifecycle stays Angular-native**
   Use `DestroyRef` / `takeUntilDestroyed` etc where needed; do not try to model component lifetimes as Effect scopes unless you have a very strong reason.

3. **Global error boundary stays Angular-native**
   Keep `provideBrowserGlobalErrorListeners()` as your last boundary.
   Inside the app, prefer typed Effect failures.

Effect “wins” here:

* I/O edges (`fetch`, localStorage, websocket, etc.)
* decoding/validation (Schema)
* dependency injection for I/O-ish services (Context + Layer)
* structured, typed errors
* testability of effectful code without Angular TestBed

---

## 5. Suggested execution order (smallest diffs, biggest coherence)

1. **Config service** (`FrontendConfigService` + layer) and wire into `AppLayer`.
2. **Logger layer** and add to `AppLayer`.
3. **Convert GraphQLClient to Tag-class style** and adjust imports.
4. **Promote hello/product APIs into services** (Tag + Live + Layer).
5. **Widen UiRuntime environment type** to `AppEnv`.
6. **Fix store error typing** (`RemoteData<Cause<...>, A>` or a UI error coproduct).
7. **Make HelloStore slice-local** like product.

Each step is individually safe and keeps the program compiling, while monotonically improving alignment.

---

If you want, I can write the concrete file skeletons (exact `FrontendConfigService` schema, the `AppLayer` composition, and one “HelloApiService” refactor) *in the exact style of your backend services*—so you can mechanically replicate it for Product.
