According to a document from **January 8, 2026**, you’ve already taken the key step that fixes most of the “gross resolver” pathology: you made the GraphQL boundary a single *natural transformation*
[
\mathrm{runEffect} : \mathrm{Effect}\langle A,E,\mathrm{AppServices}\rangle ;\Rightarrow; \mathrm{Promise}\langle A\rangle
]
and you arranged for resolvers to recover the runtime from `asyncContextProvider` rather than manually threading it. Concretely:

* `GraphQLContext` now carries `runtime: Runtime.Runtime<AppServices>` and you explicitly document the inclusion (R \hookrightarrow \mathrm{AppServices}) that makes “needs fewer services” compositional.
* `runEffect` is exactly the one “edge morphism” from `Effect` into JS `Promise`, and it’s typed against `AppServices`.
* resolvers have become small: decode via `Schema.standardSchemaV1`, then `runEffect(helloHandler(args))`.
* you’ve enabled `asyncContextProvider` at schema construction time, so `useContext()` is the intended mechanism.

That is the correct direction. The remaining TODOs are mostly about (1) pushing *business meaning* into domain/services and (2) making the layer graph and test story scale.

Below is a concrete plan that addresses each checklist item, with minimal churn.

---

## 1) Error types: localize them, then (optionally) re-export a union

Right now you have GraphQL-boundary errors (`ServerStartError`, `RuntimeMissingFromContextError`) in `src/graphql/errors.ts`. That’s good: transport errors belong to the transport boundary.

A scalable pattern is:

1. **Define errors next to the module that *introduces* them** (domain errors in domain, infra errors in infra, transport errors in transport).
2. Optionally define a **top-level coproduct** `type AppError = DomainError | InfraError | TransportError` in `src/errors.ts` *only if* you need a single public error type (often you don’t; Effect types already carry the coproduct precisely).

So, when you introduce a `GreetService` (next section), define `GreetingError` next to it if/when you need one. Keep the GraphQL errors where they are.

---

## 2) Start separating “domain” vs “application handler” vs “transport”

Today, your `helloHandler` is essentially a use-case function that computes a greeting directly.
The TODO says: “reify this interface of providing an (optional) name and getting a Greeting.”

That’s exactly “introduce a service algebra”, then let the handler be the *free composition* over that algebra.

### 2.1 Define a Greeting service (interface) + Live layer (implementation)

Create `src/services/greeting.ts` (or `src/domain/greeting/service.ts` if you prefer “domain-first”; either is fine as long as imports only go one way).

```ts
// src/services/greeting.ts
import { Context, Effect, Layer, Option, Schema } from "effect"
import type { Name } from "../domain/schemas"

// Optional but nice: make Greeting a branded string (subtype of string)
export const GreetingSchema = Schema.String.pipe(Schema.brand("Greeting"))
export type Greeting = Schema.Schema.Type<typeof GreetingSchema>

export class GreetService extends Context.Tag("GreetService")<
  GreetService,
  {
    readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>
  }
>() {}

// Live implementation: no dependencies for now
export const GreetServiceLive = Layer.succeed(
  GreetService,
  GreetService.of({
    greet: (name) =>
      Effect.succeed(
        GreetingSchema.make(`Hello, ${Option.getOrElse(name, () => "World")}!`)
      )
  })
)
```

**Why this scales:**

* The *interface* does not mention `ConfigService`, DB, etc.
* If later `greet` needs config (say a greeting prefix), you add the dependency **to the layer**, not to the method signature.

### 2.2 Update `helloHandler` to depend on the service, not compute directly

```ts
// src/domain/handlers.ts  (or move to src/application/hello.ts)
import { Effect, Option } from "effect"
import type * as schemas from "./schemas"
import { GreetService } from "../services/greeting"

export const helloHandler = (
  input: schemas.NameInput
): Effect.Effect<schemas.HelloResponse, never, GreetService> =>
  Effect.gen(function* () {
    const svc = yield* GreetService
    const greeting = yield* svc.greet(Option.fromNullable(input.name ?? null))
    const response: schemas.HelloResponse = { greeting }
    yield* Effect.logDebug("helloHandler output:", response)
    return response
  })
```

Now:

* handler logic is a morphism in the Kleisli category of `Effect` over the service environment,
* service is mockable by replacing its layer.

---

## 3) “AppServices” and layers: make the wiring explicit and future-proof

### 3.1 Expand `AppServices`

Right now, `AppServices = ConfigService`.
Change it to a coproduct of all services your runtime will provide:

```ts
// src/services/index.ts
import type { ConfigService } from "./config"
import type { GreetService } from "./greeting"

export type AppServices = ConfigService | GreetService
export { ConfigService, type Port, makePort } from "./config"
export { GreetService, GreetServiceLive } from "./greeting"
```

### 3.2 Extend `appLayer` to provide GreetService

You already merge config + logger correctly, with logger depending on config.

Update:

```ts
// src/services/layers/app.ts
import { type ConfigError, Layer } from "effect"
import type { AppServices } from "../services"
import { GreetServiceLive } from "../services/greeting"
import { configLayer } from "./config"
import { loggerLayer } from "./logger"

export const appLayer: Layer.Layer<AppServices, ConfigError.ConfigError> =
  Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
    GreetServiceLive
  )
```

This is the “wiring diagram” (a DAG) of your dependency graph.

### 3.3 Fix `makeYoga`’s required environment type

`makeYoga` currently *computes* `Effect.runtime<AppServices>()`, but its signature says it only requires `ConfigService`.
That will become wrong as soon as `AppServices` grows.

Make it require `AppServices`:

```ts
// src/graphql/yoga.ts
import { Effect } from "effect"
import { createYoga, type YogaServerInstance } from "graphql-yoga"
import type { AppServices } from "../services"
import type { GraphQLContext } from "./context"
import { schema } from "./schema"

export const makeYoga: Effect.Effect<
  YogaServerInstance<GraphQLContext, Record<string, any>>,
  never,
  AppServices
> = Effect.gen(function* () {
  const runtime = yield* Effect.runtime<AppServices>()
  return createYoga<GraphQLContext>({
    schema,
    context: (initial) => ({ ...initial, runtime }),
  })
})
```

---

## 4) Schemas best practice: keep Schemas in domain, move Arbitrary generation to tests

In `src/domain/schemas.ts` you currently export `Arbitrary.make(...)` values and note “todo: move or remove”.

Effect’s guidance is: generate a `fast-check` arbitrary from a schema via `Arbitrary.make(schema)`. 【21view0†L194-L201】

For production code, it’s typically cleaner to:

* **export only `Schema`s + types** from `src/domain/*`,
* generate arbitraries **in tests** (so you don’t drag test-oriented generation into runtime modules).

So refactor `src/domain/schemas.ts` to remove `Arbitrary` exports, and in tests do:

```ts
import { Arbitrary } from "effect"
import * as schemas from "../../src/domain/schemas"

const nameInputArb = Arbitrary.make(schemas.nameInputSchema)
```

This also prevents accidental “test dependency leakage” in your runtime graph.

---

## 5) Testing plan: 3 strata, with clear boundaries

Your worries about scaling/testing are valid; the fix is to make the boundary layers explicit and test at each boundary:

### Stratum A: pure/application tests (no GraphQL)

* Test `GreetService` (with either Live or Test layer).
* Test `helloHandler` by providing a mock `GreetService` layer.

### Stratum B: resolver tests (GraphQL resolver boundary, but not HTTP)

Two options:

1. Use Yoga’s in-memory `fetch` interface (recommended; very close to the real boundary).
2. Use gqloom’s executor to call resolvers directly (useful if you want to bypass query parsing/validation).

### Stratum C: real HTTP server tests (optional, slower)

* Start `listen(...)` on an ephemeral port, use real fetch against `http://localhost`.

---

## 6) First vitest + @effect/vitest test (and why you’ll want `it.scoped` later)

`@effect/vitest` gives you `it.effect()` and `it.scoped()` so tests can run effects directly and manage scoped resources. 【22view0†L2-L10】【22view0†L56-L63】【22view0†L82-L105】

### Minimal setup

* add dev deps: `vitest`, `@effect/vitest`, `fast-check` (I recommend installing `fast-check` explicitly).
* add `vitest.config.ts` (their example is fine). 【22view0†L30-L40】

### Test 1: unit test the handler via a mock service layer

```ts
// tests/domain/helloHandler.test.ts
import { describe, it, expect } from "@effect/vitest"
import { Effect, Layer, Option } from "effect"
import { helloHandler } from "../../src/domain/handlers"
import { GreetService } from "../../src/services/greeting"

const GreetingTest = Layer.succeed(
  GreetService,
  GreetService.of({
    greet: (name) =>
      Effect.succeed(`TEST:${Option.getOrElse(name, () => "World")}` as any)
  })
)

describe("helloHandler", () => {
  it.effect("delegates to GreetService", () =>
    helloHandler({ name: "Alice" }).pipe(
      Effect.provide(GreetingTest),
      Effect.map((res) => {
        expect(res.greeting).toBe("TEST:Alice")
      })
    )
  )
})
```

This is the core “service substitution” story you want when you add more services.

---

## 7) First arbitrary-based test (no GraphQL yet)

Use Effect Schema → fast-check arbitrary:

* `Arbitrary.make(schema)` produces a `fast-check` arbitrary. 【21view0†L194-L201】

```ts
// tests/domain/helloHandler.property.test.ts
import { describe, it, expect } from "@effect/vitest"
import { Arbitrary, Effect, Layer, Option } from "effect"
import * as fc from "fast-check"
import { helloHandler } from "../../src/domain/handlers"
import * as schemas from "../../src/domain/schemas"
import { GreetService } from "../../src/services/greeting"

const GreetingEcho = Layer.succeed(
  GreetService,
  GreetService.of({
    greet: (name) =>
      Effect.succeed(`Hello, ${Option.getOrElse(name, () => "World")}!` as any)
  })
)

describe("helloHandler (property)", () => {
  it.effect("greeting contains name-or-World", () =>
    Effect.gen(function* () {
      const arb = Arbitrary.make(schemas.nameInputSchema)

      yield* Effect.tryPromise({
        try: () =>
          fc.assert(
            fc.asyncProperty(arb, async (input) => {
              // run handler via Effect (we’ll run the Effect inside the test)
              const res = await Effect.runPromise(
                helloHandler({ name: input.name ?? null }).pipe(Effect.provide(GreetingEcho))
              )
              const who = input.name ?? "World"
              expect(res.greeting).toContain(who)
            })
          ),
        catch: (e) => e as Error
      })
    })
  )
})
```

(You can make this more “Effect-native” by avoiding `Effect.runPromise` inside the property body, but this is a pragmatic first step.)

---

## 8) First property test that hits the GraphQL boundary (Yoga fetch)

GraphQL Yoga supports testing via `yoga.fetch(...)` without starting an actual HTTP server.

Also, gqloom’s resolver input shape is an object of arguments (not a nested “input” arg), so your field call should be `hello(name: ...)`, consistent with their docs.

```ts
// tests/graphql/hello.fetch.property.test.ts
import { describe, it, expect } from "@effect/vitest"
import { Arbitrary, Effect, Layer, LogLevel } from "effect"
import * as fc from "fast-check"

import { makeYoga } from "../../src/graphql/yoga"
import * as schemas from "../../src/domain/schemas"

import { ConfigService, makePort } from "../../src/services/config"
import { GreetServiceLive } from "../../src/services/greeting"
import { loggerLayer } from "../../src/services/layers/logger"

const TestConfig = Layer.succeed(ConfigService, {
  port: makePort(0),          // unused by yoga.fetch tests
  logLevel: LogLevel.None
})

// Provide the same services your runtime expects
const TestLayer = Layer.mergeAll(
  TestConfig,
  loggerLayer.pipe(Layer.provide(TestConfig)),
  GreetServiceLive
)

describe("GraphQL hello (property)", () => {
  it.effect("hello(name) matches handler semantics", () =>
    Effect.gen(function* () {
      const yoga = yield* makeYoga.pipe(Effect.provide(TestLayer))
      const arb = Arbitrary.make(schemas.nameInputSchema)

      const query = /* GraphQL */ `
        query Hello($name: String) {
          hello(name: $name) { greeting }
        }
      `

      yield* Effect.tryPromise({
        try: () =>
          fc.assert(
            fc.asyncProperty(arb, async (input) => {
              // JSON cannot encode `undefined` → normalize to null
              const nameVar = input.name ?? null

              const res = await yoga.fetch("http://unused/graphql", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query, variables: { name: nameVar } })
              })

              const json = await res.json() as any
              expect(json.errors).toBeUndefined()

              const greeting: string = json.data.hello.greeting
              const who = input.name ?? "World"
              expect(greeting).toContain(who)
            })
          ),
        catch: (e) => e as Error
      })
    })
  )
})
```

This test is exactly what you said you want: it crosses the GraphQL boundary, uses schema-derived arbitraries, and asserts an invariant about output.

---

## 9) About “should resolvers call runEffect every time?”

Yes: **one run at the boundary is correct**, and resolvers are precisely a boundary. Your current shape:

* `asyncContextProvider` enables contextual access
* each resolver is a small wrapper around `runEffect(handler(...))`
* `runEffect` is the unique morphism into promises

That is the clean categorical story: you keep your program in `Effect`, and apply exactly one *interpretation functor* into JS at the edge.

The main improvement I’d make (later) is: switch `Runtime.runPromise` to `runPromiseExit` and translate typed errors into structured GraphQL errors in one place. (This is the same reason Effect’s runtime docs emphasize “run at the edge” and talk about ManagedRuntime for reuse across request boundaries.) ([Effect][1])

---

## 10) Repo organization recommendation

Given your TODO (“separate domain types, services, implementations”), the smallest stable layout is:

* `src/domain/*` — Schemas, branded types, domain errors (no Layer wiring here)
* `src/services/*` — service *interfaces* (Context tags) + maybe “test layers” colocated
* `src/services/layers/*` — live implementations and app wiring (`appLayer`)
* `src/application/*` (optional, but I recommend it) — handlers/use-cases that compose services
* `src/graphql/*` — schema + resolvers + server/yoga boundary

Your current split (`domain`, `services`, `layers`, `graphql`) is already close; adding `GreetService` and moving arbitraries out of domain are the first “separation pressure relief valves”.

---

## Checklist mapping to your TODOs

* **Error types organization** → keep errors local; GraphQL errors in `src/graphql/errors.ts` already good; introduce service/domain errors when needed.
* **Separate domain** → move “business capability” into `GreetService`; keep schemas in domain; handler becomes orchestration.
* **Create service called by helloHandler** → implement `GreetService` + Live layer; update `helloHandler`.
* **Fit into layers/AppServices** → extend `AppServices` coproduct; merge `GreetServiceLive` into `appLayer`.
* **First vitest test** → `@effect/vitest` with `it.effect`. 【22view0†L56-L63】
* **Organize tests by boundary** → `tests/domain/*`, `tests/graphql/*`, optional `tests/e2e/*`.
* **First arbitrary test** → `Arbitrary.make(schema)` in tests. 【21view0†L194-L201】
* **First arbitrary GraphQL-boundary property test** → `yoga.fetch` + fast-check.
* **Repo separation** → adopt the above folder semantics; avoid test-only exports in runtime modules.

If you want, the next architectural step after this is introducing a *request-scoped* service (e.g. `RequestContext` containing headers/request id) that `runEffect` automatically provides from `GraphQLContext`, so handlers can depend on it without resolvers manually threading anything. That’s the natural “indexed family of environments” refinement once you add auth, tracing, etc.

[1]: https://effect.website/docs/getting-started/running-effects/?utm_source=chatgpt.com "Running Effects | Effect Documentation"
