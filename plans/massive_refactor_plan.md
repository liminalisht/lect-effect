Here’s how I’d push your codebase toward the “everything-but-(domain ⊔ services) is extractable” fixed point, with special attention to `config/`.

## 0. What you already have (and what it suggests)

Right now `ConfigService` is a *single* service whose value is essentially a product
[
\textsf{ConfigServiceShape} ;\cong; \textsf{AppConfig} \times \textsf{MasterdataDbConfig}.
]
You can see that in the interface: it literally exposes `{ app, masterdataPg }`.

And the two downstream consumers each use only one projection:

* `loggerLayer` uses only `app.logLevel`.
* `masterdataDbLayer` uses only `masterdataPg.*` to build a `PgClientConfig`.

That’s exactly the categorical smell of a product object packed into one tag, while clients really want the projections.

Also: your `src/config/*` directory is *pure contract* (schemas/types/errors), and it is imported exclusively to define/implement the config *service*.
So yes: it wants to live under “service interfaces” (or at least under `services/` as “configuration ports”).

---

## 1. Refactor: split `ConfigService` into two services (product → projections)

### 1.1 New interfaces (ports)

Create two tags:

* `AppConfigService : Tag<AppConfig>`
* `MasterdataDbConfigService : Tag<MasterdataDbConfig>`

Conceptually:
[
\textsf{ConfigService} ;\rightsquigarrow; \pi_1:\textsf{AppConfigService},; \pi_2:\textsf{MasterdataDbConfigService}
]
so any consumer only quantifies over the component it needs.

Concretely, this reduces required environments (R) for effects, which matters for your “handlers determine required services” story.

### 1.2 New layers

Replace the single `configLayer` (which currently constructs both values at once ) with:

* `appConfigLayer : Layer<AppConfigService, ConfigurationError>`
* `masterdataDbConfigLayer : Layer<MasterdataDbConfigService, ConfigurationError>`
* `configLayer = Layer.mergeAll(appConfigLayer, masterdataDbConfigLayer)`

### 1.3 Update downstream layers

* `loggerLayer` should depend on `AppConfigService`, not the product. Today it depends on `ConfigService`.
* `masterdataDbLayer` should depend on `MasterdataDbConfigService`. Today it depends on `ConfigService` and immediately projects `cfg.masterdataPg`.

### 1.4 Optional but very aligned: introduce a third config service

In `masterdataDbLayer` you already note the construction of `PgClientConfig` “should be constructed in our config layer.”

Take that seriously and define:

* `PgClientConfigService : Tag<Config.Config<PgClientConfig>>`

Then:

* `pgClientConfigLayer` is built purely from `MasterdataDbConfigService`
* `masterdataDbLayer` depends on `PgClientConfigService` (and no longer knows about your env vars)

This is a clean “pushout” move: DB layer becomes transport-agnostic with respect to *where* config came from.

### 1.5 Update the service union

`AppServices` currently includes `ConfigService`.
Replace it with the two (or three) refined config services.

---

## 2. Move `src/config/*` under `services/interfaces` (or at least under `services/`)

You can do this in a mechanically safe way:

### 2.1 Suggested target layout

```
src/services/interfaces/config/
  app/
    environment.ts    // environmentSchema, Environment
    port.ts           // portSchema, Port
    loglevel.ts       // ConfiguredLogLevel
    appConfig.ts      // AppConfig
  masterdataDb/
    masterdataDbConfig.ts  // MasterdataDbConfig (+ maybe Schema)
  errors.ts           // ConfigurationError
  index.ts            // re-exports
```

Everything currently in `src/config/app/*`, `src/config/app.ts`, `src/config/masterdataDb.ts`, `src/config/errors.ts` can land here.

### 2.2 Transitional trick (keeps imports stable)

If you want a non-breaking migration, keep `src/config/*` as *re-export shims* for one PR:

```ts
// src/config/app/port.ts
export * from "../../services/interfaces/config/app/port"
```

Then later delete `src/config`.

This is like inserting an isomorphism in the path category so you can rewrite gradually.

---

## 3. Move `domain/*` → `domain/schemas/*` (and why it helps the “extractable library” goal)

Right now your `domain/*` is almost entirely Schema-first value objects and DTO-ish records. That’s already “schemas,” so renaming makes the ontology explicit.

### 3.1 Target layout

```
src/domain/
  schemas/
    hello/...
    item/...
    product/...
  errors.ts   // (if it’s truly domain-level)
  index.ts    // export surface
```

### 3.2 Preserve a stable import surface

Either:

* keep `src/domain/hello/*` as re-export shims, OR
* introduce `src/domain/index.ts` and switch imports to `domain/schemas/...` once.

This matters because services and handlers import domain types everywhere (e.g. `environmentSchema`, `portSchema`, etc. already behave like this).

---

## 4. Move handlers → `handlers/domain` (and isolate “handler calculus” for extraction)

You have two different things living in `handlers/`:

1. **The calculus / syntax of handlers** (`handlers/generic.ts`): the type-level DSL for `QueryHandler | MutationHandler | FieldHandler`.
2. **The domain-specific inhabitants** (`hello.ts`, `item.ts`, `product.ts`): concrete morphisms (I \to \mathrm{Effect}(R,E,O)).

To get to your library boundary, separate them:

### 4.1 Target layout

```
src/handlers/
  domain/
    hello.ts
    item.ts
    product.ts
```

…and move `handlers/generic.ts` into the would-be library package location (see §5). Domain handlers should depend only on:

* domain schemas
* service tags (interfaces)
* Effect/Schema/Option utilities

They should not depend on GraphQL or server wiring (they currently don’t, which is great).

---

## 5. Make the “extractable library” boundary literal: a single functor from handlers to a running GraphQL API

Your goal statement is essentially:

> Given a family of handlers (H) and a layer (L) implementing the services they quantify over, produce a running GraphQL API.

In symbols, each handler is a Kleisli arrow
[
h : I \to \mathsf{Effect}_{R,E}(O),
]
and your library is a construction that:

* converts a finite family of such arrows into GraphQL resolvers
* supplies an evaluator (\mathsf{Effect}_{R,E}(-) \to \mathsf{Promise}(-)) using a runtime built from `Layer<R, E>`.

### 5.1 What to change in your current GraphQL code to enable extraction

Right now some GraphQL modules still “mention the concrete app union” (`AppServices`) even when they’re semantically generic. The library should quantify over an arbitrary (R), not a particular one.

So, make these modules fully parametric:

* Remove `AppServices` imports/usages from GraphQL helpers.
* Keep everything generic in (R) and (E).

(Your `makeYoga<R>(schema)` is already structurally parametric; you just want to delete any accidental dependence on the concrete app union.)

### 5.2 Introduce one top-level entrypoint (the library surface)

Create something like:

```
src/platform/graphql/runGraphqlApi.ts
```

with one exported function, conceptually:

* Inputs:

  * `handlers: readonly AnyHandler[]` (or better, `AnyHandler<_, R>[]`)
  * `layer: Layer<R, E>`
  * `server options` (port, endpoint, etc.) OR provide these via a config service
* Output:

  * `Effect<never, E | ServerStartError, never>` (or scoped)

Then your app “main” becomes trivial:

* assemble handlers
* assemble layer(s)
* call `runGraphqlApi(...)`

This exactly matches your desired library surface area.

### 5.3 Make `src/app.ts` disappear (or become a thin wrapper)

Today `src/app.ts` does:

* load config from `ConfigService`
* select handlers
* build resolvers
* build schema
* build yoga
* listen

That entire composite is *framework*, i.e. library-candidate.

So after you split config services and parametrize GraphQL over (R), `src/app.ts` can be replaced by:

* a library function `runGraphqlApi`
* an app entrypoint that supplies:

  * handlers
  * layers
  * (maybe) which handlers are exposed

### 5.4 Handler selection becomes part of the library API

Your “tell me the handlers you want to turn into graphql resolvers” can be implemented as:

* user passes `handlers: readonly AnyHandler[]` (already “selected”)
* or user passes `(handlers, allowlist)` where allowlist selects by `(name, operation)`; i.e. a subobject classifier on the set of handlers.

That allowlist is precisely the “exposed surface” of the API.

---

## 6. A pragmatic sequence of commits (keeps the diagram commuting)

1. **Split config services** (no folder moves yet)

   * Add `AppConfigService`, `MasterdataDbConfigService`
   * Make `loggerLayer`, `masterdataDbLayer` consume projections
   * Adapt `AppServices` and tests (your test config layer is currently a mirror of prod config )

2. **Move config contracts under services**

   * Introduce `services/interfaces/config/*`
   * Add re-export shims in `src/config/*`
   * Update imports in layers/tests
   * Remove shims

3. **Move domain → domain/schemas**

   * Add `domain/schemas/*`
   * Either shims or one-time import rewrite

4. **Move handlers → handlers/domain**

   * Keep the handler calculus separate from domain handlers

5. **Introduce `platform/graphql/runGraphqlApi`**

   * Move/compose the logic from `src/app.ts` into this function
   * Make `src/index.ts` call it with `{ handlers, layer }`

6. **Extract library**

   * The library package contains:

     * handler calculus (generic handler types)
     * GraphQL wiring (`handlersToResolvers`, schema/yoga/server)
     * `runGraphqlApi`
   * The app package contains:

     * `domain/**`
     * `services/**` (interfaces + implementations/layers)
     * `handlers/domain/**`
     * a tiny `main.ts`

---

## 7. One extra thought: keep “domain” transport-agnostic if you want future freedom

Right now many domain records include `__typename`, which is GraphQL-ish. If your endgame is “GraphQL as one adapter among many,” you might eventually want:

* domain schemas without `__typename`
* GraphQL adapter adds `__typename` as a *natural transformation* from domain objects into GraphQL object shapes

Not required for your stated goal (GraphQL-focused), but it’s the next categorical relaxation if you ever want it.

---

If you want, I can sketch the *exact* new file/module signatures (Typescript types + `Layer` composition) for the split config services and the `runGraphqlApi` entrypoint, using your existing naming conventions—so you can basically copy/paste the scaffolding and then do the mechanical rewires.

-------


Excellent — here’s a concrete scaffolding sketch that fits your existing naming and layering style.

---

## 1. Split Config Services

### 1.1 `services/interfaces/config/appConfig.ts`

```ts
import { Context, Layer, Tag } from "effect"
import { AppConfig, ConfigurationError, makeAppConfig } from "@/services/interfaces/config/schemas"

export class AppConfigService extends Tag<AppConfigService, AppConfig>()("AppConfigService") {}

export const appConfigLayer = Layer.effect(
  AppConfigService,
  Effect.tryPromise({
    try: () => makeAppConfig(),
    catch: (err) => new ConfigurationError({ message: `Failed to load AppConfig: ${String(err)}` })
  })
)
```

Here `makeAppConfig()` is whatever effectful function constructs your `AppConfig` from environment variables (currently inside your unified config layer). You can refactor that part into `services/interfaces/config/schemas/app/makeAppConfig.ts`.

---

### 1.2 `services/interfaces/config/masterdataDbConfig.ts`

```ts
import { Context, Layer, Tag } from "effect"
import { MasterdataDbConfig, ConfigurationError, makeMasterdataDbConfig } from "@/services/interfaces/config/schemas"

export class MasterdataDbConfigService extends Tag<
  MasterdataDbConfigService,
  MasterdataDbConfig
>()("MasterdataDbConfigService") {}

export const masterdataDbConfigLayer = Layer.effect(
  MasterdataDbConfigService,
  Effect.tryPromise({
    try: () => makeMasterdataDbConfig(),
    catch: (err) => new ConfigurationError({ message: `Failed to load MasterdataDbConfig: ${String(err)}` })
  })
)
```

---

### 1.3 Optional — Build `PgClientConfigService`

If you want to internalize DB client config construction:

```ts
import { Layer, Tag } from "effect"
import { MasterdataDbConfigService } from "@/services/interfaces/config/masterdataDbConfig"
import { PgClientConfig, makePgClientConfig } from "@/services/interfaces/db/pgClientConfig"

export class PgClientConfigService extends Tag<
  PgClientConfigService,
  PgClientConfig
>()("PgClientConfigService") {}

export const pgClientConfigLayer = Layer.effect(
  PgClientConfigService,
  Effect.gen(function*(_) {
    const dbCfg = yield* _(MasterdataDbConfigService)
    return makePgClientConfig(dbCfg)
  })
)
```

Then your `masterdataDbLayer` depends on `PgClientConfigService` only.

---

### 1.4 Combined Layer for app bootstrap

```ts
export const configLayer = Layer.mergeAll(appConfigLayer, masterdataDbConfigLayer)
```

Optionally also merge `pgClientConfigLayer` if used.

---

## 2. Update Layers Using These Services

### 2.1 `services/implementations/loggerLayer.ts`

```ts
import { Layer } from "effect"
import { AppConfigService } from "@/services/interfaces/config/appConfig"
import { LoggerService, makeLogger } from "@/services/implementations/logger"

export const loggerLayer = Layer.effect(
  LoggerService,
  Effect.gen(function*(_) {
    const { logLevel } = yield* _(AppConfigService)
    return makeLogger({ level: logLevel })
  })
)
```

### 2.2 `services/implementations/masterdataDbLayer.ts`

```ts
import { Layer } from "effect"
import { PgClientConfigService } from "@/services/interfaces/config/pgClientConfig"
import { MasterdataDbService, makeMasterdataDb } from "@/services/implementations/masterdataDb"

export const masterdataDbLayer = Layer.effect(
  MasterdataDbService,
  Effect.gen(function*(_) {
    const pgConfig = yield* _(PgClientConfigService)
    return makeMasterdataDb(pgConfig)
  })
)
```

---

## 3. Update `AppServices`

In `services/appServices.ts`:

```ts
import { AppConfigService, MasterdataDbConfigService } from "@/services/interfaces/config"
import { MasterdataDbService } from "@/services/implementations/masterdataDb"
import { LoggerService } from "@/services/implementations/logger"

export interface AppServices
  extends
    | AppConfigService
    | MasterdataDbConfigService
    | LoggerService
    | MasterdataDbService {}
```

Or equivalently:

```ts
export type AppServices =
  AppConfigService | MasterdataDbConfigService | MasterdataDbService | LoggerService
```

---

## 4. The `runGraphqlApi` Entrypoint

### 4.1 File: `platform/graphql/runGraphqlApi.ts`

```ts
import { Layer, Effect } from "effect"
import { YogaServer, makeYogaServer } from "@/platform/graphql/yoga"
import { handlersToResolvers } from "@/platform/graphql/handlersToResolvers"
import { buildSchema } from "@/platform/graphql/schema"
import { AnyHandler } from "@/handlers/generic"

export interface RunGraphqlApiOptions<R, E> {
  handlers: readonly AnyHandler<R, E, any>[]
  layer: Layer<R, E>
  port?: number
  endpoint?: string
}

/**
 * Given a set of handlers and a layer implementing required services,
 * builds and runs a GraphQL API server.
 */
export const runGraphqlApi = <R, E>({
  handlers,
  layer,
  port = 4000,
  endpoint = "/graphql"
}: RunGraphqlApiOptions<R, E>): Effect<never, E, never> =>
  Effect.gen(function*(_) {
    const resolvers = handlersToResolvers(handlers)
    const schema = buildSchema(resolvers)
    const yoga = makeYogaServer({ schema, endpoint })

    yield* _(Effect.logInfo(`GraphQL server starting on port ${port}`))
    yield* _(yoga.start(port))
  }).pipe(Effect.provide(layer))
```

### 4.2 `src/main.ts` (or `app.ts`) becomes:

```ts
import { configLayer } from "@/services/interfaces/config"
import { loggerLayer } from "@/services/implementations/loggerLayer"
import { masterdataDbLayer } from "@/services/implementations/masterdataDbLayer"
import { runGraphqlApi } from "@/platform/graphql/runGraphqlApi"
import { domainHandlers } from "@/handlers/domain"

const appLayer = Layer.mergeAll(configLayer, loggerLayer, masterdataDbLayer)

runGraphqlApi({
  handlers: domainHandlers,
  layer: appLayer,
  port: 4000
})
```

---

## 5. Effect Algebraic View

After these transformations:
[
\textsf{runGraphqlApi} : (\textsf{Handlers}_R, \textsf{Layer},R) \to \textsf{Effect},1
]
Your runtime layer composition now reads as:
[
(\textsf{AppConfigService} \times \textsf{MasterdataDbConfigService} \times \textsf{LoggerService} \times \textsf{MasterdataDbService})
]
and your handlers quantify over subsets of this product, letting the library generically supply the rest.

---

Would you like me to also sketch the revised **file tree layout** (post-refactor, including `services/interfaces/config`, `handlers/domain`, `domain/schemas`, and `platform/graphql`)? That would make it easy to plan the directory migrations systematically.

--------

Cool — here’s a concrete **post-refactor tree** that makes the “extractable library” boundary almost tautological. I’m going to present it as two packages in one repo (monorepo style), but you can also keep it as a single package and just mentally treat `platform/graphql/*` as the future library.

---

## A. Target directory tree (single repo, library-shaped)

```
src/
  domain/
    schemas/
      hello/
        Hello.ts
        HelloId.ts
        index.ts
      item/
        Item.ts
        ItemId.ts
        index.ts
      product/
        Product.ts
        ProductId.ts
        index.ts
    index.ts                 // re-export public domain surface

  services/
    interfaces/
      config/
        app/
          Environment.ts      // environmentSchema + type
          Port.ts             // portSchema + type
          LogLevel.ts         // ConfiguredLogLevel
          AppConfig.ts        // AppConfig schema + type (+ makeAppConfig)
          makeAppConfig.ts
          index.ts
        masterdataDb/
          MasterdataDbConfig.ts
          makeMasterdataDbConfig.ts
          index.ts
        errors.ts             // ConfigurationError
        AppConfigService.ts   // Tag + layer
        MasterdataDbConfigService.ts
        index.ts              // export { AppConfigService, ... , configLayer }
      db/
        PgClientConfig.ts     // PgClientConfig type (maybe Effect.Config<PgClientConfig>)
        PgClientConfigService.ts
        index.ts
      logger/
        LoggerService.ts      // Tag + interface (if you want it)
        index.ts
      masterdata/
        MasterdataDbService.ts
        index.ts
      index.ts               // “service ports”: all Tags / interfaces

    implementations/
      config/
        // (often empty if config is fully “interface-side”; optional)
      db/
        masterdata/
          masterdataDbLayer.ts
          makeMasterdataDb.ts
          index.ts
      logger/
        loggerLayer.ts
        makeLogger.ts
        index.ts
      index.ts               // “service algebras”: concrete layers

    appServices.ts           // optional: AppServices = union of chosen Tags

  handlers/
    generic/
      handlerTypes.ts        // QueryHandler | MutationHandler | FieldHandler, etc.
      index.ts
    domain/
      hello.ts
      item.ts
      product.ts
      index.ts               // exports domainHandlers: readonly AnyHandler[]
    index.ts                 // exports generic + domain (optional)

  platform/
    graphql/
      handlerSelection.ts    // optional allowlist/projection on handlers
      handlersToResolvers.ts
      schema/
        buildSchema.ts
        index.ts
      yoga/
        makeYogaServer.ts
        index.ts
      runGraphqlApi.ts       // THE entrypoint you want to extract
      index.ts

  main.ts                    // tiny composition root for this app
```

### Why this shape works

Think of:

* `domain/**` as a category of “pure objects + relations” (schemas/types).
* `services/interfaces/**` as a category of **ports** (Tags) and their required types.
* `services/implementations/**` as **models** of those ports (Layers).
* `handlers/domain/**` as a family of Kleisli arrows (I \to \mathrm{Effect}_{R,E}(O)) that mention only domain + ports.
* `platform/graphql/**` as a functor:
  [
  \mathsf{Handlers} \times \mathsf{Layer}(R,E) \to \mathsf{RunnableGraphQLServer}.
  ]

So extraction is just: move `platform/graphql/**` + `handlers/generic/**` into a new package.

---

## B. Same tree, but explicitly split into “extractable library” vs “app”

If you actually want the repo to *already* encode your goal, this is the clearest:

```
packages/
  graphql-effect-api/                // the extractable library
    src/
      handlers/
        generic/
          handlerTypes.ts
          index.ts
      platform/
        graphql/
          handlersToResolvers.ts
          schema/buildSchema.ts
          yoga/makeYogaServer.ts
          runGraphqlApi.ts
          index.ts
    package.json

  my-app/                            // your concrete application
    src/
      domain/
        schemas/...
        index.ts
      services/
        interfaces/...
        implementations/...
        appServices.ts
      handlers/
        domain/...
        index.ts
      main.ts
    package.json
```

And then **library surface area** becomes literally:

* `runGraphqlApi({ handlers, layer, ... })`
* `handlerTypes` (so apps can type their handlers correctly)

Everything else lives in the app.

---

## C. A migration-friendly version (keeps old paths temporarily)

If you want to do it with minimal disruption, keep “shim” folders that re-export from the new structure:

```
src/
  config/                            // TEMP shim; delete later
    app/...
    masterdataDb.ts
    errors.ts
    index.ts
  domain/                            // TEMP; gradually moved under schemas/
    hello/...
    item/...
    product/...
  handlers/                          // TEMP; domain handlers moved under handlers/domain
    generic.ts
    hello.ts
    item.ts
    product.ts
```

These become re-export-only modules during the transition.

---

## D. One small but important naming convention

To help your “surface area” story, I’d standardize names:

* Interfaces/ports: `XxxService` (Tag) where value is “capability”
* Concrete model: `xxxLayer`
* Pure schema/type: `Xxx` (no “Service” in domain types)

So:

* `AppConfig` (type/schema)
* `AppConfigService` (Tag providing `AppConfig`)
* `appConfigLayer` (Layer that constructs it)

This makes grepping and navigation trivial.

---

## E. Your “everything-not-(domain ⊔ services) is extractable” criterion

With the tree above, you can state it as:

* App-specific part = `domain/**`, `services/**`, `handlers/domain/**`, `main.ts`
* Extractable part = `handlers/generic/**`, `platform/graphql/**`

Equivalently:
[
\textsf{App} \cong (\textsf{Domain} \times \textsf{Services} \times \textsf{DomainHandlers}) ;;\text{plugged into};; \textsf{GraphQLRuntime}.
]

---

If you want, next I can give you a **mechanical rewrite checklist** (“move file X → Y; update import paths; update Layer dependencies; update `AppServices` union; update tests”) that corresponds 1:1 with this tree, so you can do the refactor in a few clean PRs without “half-moved” states lingering.



-------


Alright — here’s a **mechanical, PR-by-PR rewrite checklist** that gets you to the target tree with minimal “limbo” time. I’ll write it as a sequence of commuting squares: each PR preserves buildability by inserting temporary re-export shims when needed.

---

## PR 1 — Split `ConfigService` into projections (no moves yet)

### 1. Add new Tags

Create:

* `src/services/interfaces/config/AppConfigService.ts`
* `src/services/interfaces/config/MasterdataDbConfigService.ts`

Each exports:

* `class ... extends Tag<..., AppConfig>()(...) {}`
* `...Layer : Layer<..., ConfigurationError>`

### 2. Extract constructors from unified config layer

In your current unified config layer (`configLayer` now), identify the two “subcomputations”:

* `makeAppConfig : Effect<never, ConfigurationError, AppConfig>`
* `makeMasterdataDbConfig : Effect<never, ConfigurationError, MasterdataDbConfig>`

These are the exact pieces currently building `{ app, masterdataPg }`. (Right now it’s done in one shot ; split that functionally.)

### 3. Update downstream layers to depend on projections

Replace in:

* `loggerLayer`: `ConfigService` → `AppConfigService` (it only uses `app.logLevel` )
* `masterdataDbLayer`: `ConfigService` → `MasterdataDbConfigService` (it only uses `masterdataPg.*` )

### 4. Keep compatibility: preserve `ConfigService` temporarily

So you don’t have to rewrite all call sites at once:

* Keep existing `ConfigService` tag and `configLayer`
* Implement `ConfigService` layer as `Layer.mergeAll(appConfigLayer, masterdataDbConfigLayer)` plus a tiny “product adapter” if any code still expects the old shape.

Concretely: either

* delete `ConfigService` immediately and update all consumers, **or**
* keep it as a derived service:
  [
  \textsf{ConfigService} \cong \textsf{AppConfigService} \times \textsf{MasterdataDbConfigService}.
  ]

### 5. Update `AppServices`

Replace inclusion of `ConfigService` with the two new services in `AppServices` union/interface. (`AppServices` currently includes `ConfigService`. )

✅ End state PR 1: everything compiles; config is split; no folders moved.

---

## PR 2 — Optional: introduce `PgClientConfigService` (tightens the DB adapter)

### 1. Add the port

Create:

* `src/services/interfaces/db/PgClientConfigService.ts`

Exports:

* `PgClientConfigService` tag
* `pgClientConfigLayer` depending on `MasterdataDbConfigService`

### 2. Update `masterdataDbLayer`

Change dependency from `MasterdataDbConfigService` to `PgClientConfigService`.

This realizes the TODO you already wrote (“should be constructed in our config layer”).

✅ End state PR 2: DB layer is oblivious to env var semantics; it only consumes a DB-client-config port.

---

## PR 3 — Move `src/config/*` → `src/services/interfaces/config/schemas/*` (with shims)

### 1. Create destination tree

Add:

```
src/services/interfaces/config/schemas/
  app/
    Environment.ts
    Port.ts
    LogLevel.ts
    AppConfig.ts
  masterdataDb/
    MasterdataDbConfig.ts
  errors.ts
  index.ts
```

Move files mechanically:

* `src/config/app/environment.ts` → `.../schemas/app/Environment.ts`
* `src/config/app/port.ts` → `.../schemas/app/Port.ts`
* `src/config/app.ts` → `.../schemas/app/AppConfig.ts`
* `src/config/masterdataDb.ts` → `.../schemas/masterdataDb/MasterdataDbConfig.ts`
* `src/config/errors.ts` → `.../schemas/errors.ts`

### 2. Add re-export shims in old paths (temporary)

Replace old modules with:

```ts
export * from "@/services/interfaces/config/schemas/..."
```

So imports don’t all need updating in one PR.

### 3. Update internal imports in the new services

Have `AppConfigService.ts` import `AppConfig` and `ConfigurationError` from the new location.

✅ End state PR 3: new layout exists; old imports still work.

---

## PR 4 — Remove `src/config/*` shims and rewrite imports

### 1. Rewrite imports across repo

Update any `@/config/...` imports to `@/services/interfaces/config/schemas/...`.

### 2. Delete `src/config` folder

Once the graph has no incoming edges to the shim nodes, delete them.

✅ End state PR 4: config contracts truly live under `services/interfaces`.

---

## PR 5 — Move `handlers/*` → `handlers/generic` and `handlers/domain`

### 1. Create structure

```
src/handlers/generic/
src/handlers/domain/
```

### 2. Move “handler calculus” first

Move `src/handlers/generic.ts` → `src/handlers/generic/handlerTypes.ts` (or similar).
Add `src/handlers/generic/index.ts`.

### 3. Move concrete handlers

Move:

* `src/handlers/hello.ts` → `src/handlers/domain/hello.ts`
* `src/handlers/item.ts` → `src/handlers/domain/item.ts`
* `src/handlers/product.ts` → `src/handlers/domain/product.ts`

Add `src/handlers/domain/index.ts` exporting `domainHandlers: readonly AnyHandler[]`.

### 4. Add shims (optional)

If you want no big bang: keep `src/handlers/hello.ts` as `export * from "./domain/hello"` for one PR.

✅ End state PR 5: generic calculus is separated from domain inhabitants.

---

## PR 6 — Move `domain/*` → `domain/schemas/*` (with shims)

### 1. Create `src/domain/schemas/*`

Move each domain module accordingly.

### 2. Provide `src/domain/index.ts`

Re-export all domain schemas through a stable barrel so future refactors don’t cascade.

### 3. Add shims for old import paths (optional)

Same re-export trick, then later delete.

✅ End state PR 6: “domain is schemas” is explicit.

---

## PR 7 — Introduce `platform/graphql/runGraphqlApi` and parametrize GraphQL over `R`

### 1. Create `src/platform/graphql/runGraphqlApi.ts`

Lift the wiring out of `src/app.ts` (which currently orchestrates config, handlers, yoga, listening ).

Signature should be:

* input: `{ handlers, layer, port?, endpoint? }`
* output: `Effect<never, E, never>` (or scoped)

### 2. Ensure no `AppServices` references inside platform code

Replace any `AppServices`-specific types with generic `R`.

This is the key “library-candidate” move: platform code must be polymorphic in the required environment.

### 3. Make `src/main.ts` tiny

Replace `src/app.ts` or turn it into:

* compose `Layer.mergeAll(...)`
* pass `handlers` to `runGraphqlApi`

✅ End state PR 7: you can now “plug handlers + layer” to run the server.

---

## PR 8 — Library boundary cleanup (optional now, easy later)

### 1. Collect library-candidate modules

The set you can extract is now basically:

* `src/handlers/generic/**`
* `src/platform/graphql/**`

### 2. Ensure they depend only on:

* Effect (and GraphQL runtime libs)
* handler calculus types
* *not* on app domain or services *except* through the parametric handler type

This gives you the precise “surface area” you wanted:

* choose handlers
* provide layer implementing required services
* get a GraphQL API

✅ End state PR 8: extraction is a `git mv` operation.

---

## Quick “grep-driven” sanity checks after each PR

* After PR 1–2: `grep -R "ConfigService" src` should go to ~0 (or only the compatibility adapter).
* After PR 4: `grep -R "@/config" src` should be 0.
* After PR 5: `grep -R "handlers/generic.ts" src` should be 0; new imports point to `handlers/generic`.
* After PR 7: `grep -R "AppServices" src/platform/graphql` should be 0.

---

## One more structural invariant (worth enforcing early)

**Handlers must not import platform.**
i.e. there should be no edges from `handlers/domain/**` into `platform/graphql/**`. The direction is:
[
\textsf{platform} \to \textsf{handlers} \to (\textsf{services interfaces} ;&; \textsf{domain}).
]
This ensures extraction remains a functorial “wrap” around handlers, not entangled with them.

---

If you want, I can also produce a **concrete diff-like mapping** (“old path → new path”) for every file I saw referenced in your code, plus a list of the exact import lines that will change in `loggerLayer`, `masterdataDbLayer`, `app.ts/main.ts`, and tests.
