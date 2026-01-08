The main structural issue is that we’re treating the **Effect runtime** as if it must be “threaded through” the whole GraphQL layer, when in fact it should be treated as a **single interpretation functor** from our “free program” (Effects) into `Promise`/Node IO, and only applied at the *boundary* (GraphQL resolver execution). Right now we’re also forcing that interpretation by extracting a runtime via `runSync` inside resolver construction, which is both stylistically and architecturally brittle.

Below is a refactor that makes the dependency graph explicit via **Layers**, makes config a first-class **Service**, uses Effect’s **Config** API (and optionally Schema-based config decoding), and uses **GQLoom context injection** (`useContext`) to avoid manually passing the runtime into every resolver factory. This aligns with GQLoom’s design: contexts are implicitly available inside resolvers via AsyncLocalStorage.


---

## 1. The key architectural move: stop threading the runtime; inject it via Yoga/GQLoom context

GQLoom already gives you a *cartesian-style* implicit environment for resolvers: `useContext()` reads the per-request context via AsyncLocalStorage, so you don’t need to pass “runtime” around manually.

So:

* Build your full application runtime **once** (inside `Effect` main, after providing `appLayer`).
* Put `runtime` onto Yoga’s `context`.
* In resolvers, call a single helper `run(effect)` which grabs `runtime` via `useContext()` and runs the effect.

This keeps the “interpretation” natural: resolvers become morphisms in the Kleisli category of `Effect`, and only at the outer boundary do you interpret into `Promise`.

---

## 2. Layers: make dependencies explicit using `Layer.provide` / `Layer.provideMerge`

Right now you’re mostly merging. For *dependent* layers (Logger depends on Config), use `Layer.provide` / `Layer.provideMerge` so the dependency graph is explicit and memoized correctly. Effect’s own guidance shows this pattern and when to use `provideMerge` to keep upstream services in the output.

Also: define layers as **stable values**, not functions you call repeatedly, to preserve memoization by reference equality.



---

## 3. Schemas: use `Schema.annotations({ title })` for GraphQL naming and `standardSchemaV1` for GQLoom

For GQLoom+Effect integration, the docs explicitly use `Schema.standardSchemaV1` and recommend using `annotations({ title })` to control naming.

Also: your current “double optional” pattern is not a best practice (`Schema.optional(...).pipe(Schema.optional)`); it obscures intent. Use exactly one notion of optionality/nullable per field.

---

## 4. A concrete refactor

### 4.1 New/updated file layout

```
src/
  app/
    appLayer.ts
    Main.ts
  config/
    AppConfig.ts
  graphql/
    schema.ts
    context.ts
    runEffect.ts
  handlers/
    hello.ts
  resolvers/
    hello.ts
    index.ts
  services/
    HelloService.ts
  server/
    yoga.ts
    http.ts
  index.ts
```

You can keep your existing folders if you prefer; this just makes the “topos” of dependencies clearer: config → logger → services → handlers → resolvers → server.

---

## 4.2 Config as a Service (values, not “getters returning Effects”)

### `src/config/AppConfig.ts`

```ts
import { Config, Effect, Layer, LogLevel, Schema } from "effect"

// optional: validate PORT via Schema (string env → number)
const Port = Schema.NumberFromString.pipe(
  Schema.int(),
  Schema.between(1, 65535),
  Schema.annotations({ title: "Port" })
)

export class AppConfig extends Effect.Tag("AppConfig")<
  AppConfig,
  {
    readonly port: number
    readonly logLevel: LogLevel.LogLevel
  }
>() {
  static readonly Live = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      // Read from env via Effect Config; default if missing.
      const port = yield* Schema.Config("PORT", Port).pipe(
        Config.withDefault(3000)
      )

      const logLevel = yield* Config.logLevel("LOG_LEVEL").pipe(
        Config.withDefault(LogLevel.Info)
      )

      return AppConfig.of({ port, logLevel })
    })
  )
}
```

Notes:

* This makes config a *constant object* service, which is the usual pattern: load once at startup, then read cheaply.
* You can expand this with `NODE_ENV`, URLs, secrets, etc.

(Using `Schema.Config` is a nice way to keep “stringly-typed env” from leaking. The general “Layer/provide” composition approach is consistent with Effect’s docs. )

---

## 4.3 Logger layer depends on config (explicitly)

### `src/app/appLayer.ts`

Here’s the important part: use `Layer.provide` / `Layer.provideMerge` so the dependency arrow `AppConfig ⟶ Logger` is explicit.

```ts
import { Effect, Layer, Logger } from "effect"
import { AppConfig } from "../config/AppConfig"
import { HelloService } from "../services/HelloService"

// Logger depends on AppConfig
const LoggerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { logLevel } = yield* AppConfig
    return Logger.minimumLogLevel(logLevel)
  })
)

// Fully resolved infra: provides Logger and AppConfig, requires nothing.
const InfraLayer = LoggerLive.pipe(
  Layer.provide(AppConfig.Live),
  Layer.provideMerge(AppConfig.Live)
)

export type AppEnv = AppConfig | HelloService

export const appLayer = Layer.merge(InfraLayer, HelloService.Live)
```

This mirrors the “provide then provideMerge” pattern in the docs (provide dependencies, then merge upstream outputs when you want them available downstream).

Also: keep `AppConfig.Live` as a stable value and reuse it, to avoid accidental double-allocation.

---

## 4.4 Service definition stays simple

### `src/services/HelloService.ts`

```ts
import { Effect, Layer } from "effect"

export class HelloService extends Effect.Tag("HelloService")<
  HelloService,
  {
    readonly sayHello: (name?: string) => Effect.Effect<string>
  }
>() {
  static readonly Live = Layer.succeed(HelloService, {
    sayHello: (name) =>
      Effect.gen(function* () {
        const who = name ?? "World"
        yield* Effect.logInfo(`Saying hello to ${who}`)
        return `Hello, ${who}!`
      })
  })
}
```

This keeps business logic effectful and testable.

---

## 4.5 Handler remains a pure Effect program (no runtime)

### `src/handlers/hello.ts`

```ts
import { HelloService } from "../services/HelloService"

export interface HelloInput {
  readonly name?: string
}

export const helloHandler = (input: HelloInput) =>
  HelloService.sayHello(input.name)
```

---

## 4.6 Yoga context carries the runtime + requestId

### `src/graphql/context.ts`

```ts
import type { Runtime } from "effect"
import type { YogaInitialContext } from "graphql-yoga"
import type { AppEnv } from "../app/appLayer"

export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppEnv>
  readonly requestId: string
}
```

### `src/server/yoga.ts`

```ts
import { createYoga } from "graphql-yoga"
import { randomUUID } from "node:crypto"
import type { Runtime } from "effect"
import type { AppEnv } from "../app/appLayer"
import type { GraphQLContext } from "../graphql/context"
import { schema } from "../graphql/schema"

export const createYogaApp = (runtime: Runtime.Runtime<AppEnv>) =>
  createYoga<GraphQLContext>({
    schema,
    context: (initial) => ({
      ...initial,
      runtime,
      requestId: initial.request.headers.get("x-request-id") ?? randomUUID()
    })
  })
```

Now every resolver can access `runtime` without passing it manually. This is exactly what GQLoom’s context mechanism is for.

---

## 4.7 One universal “runEffect” for resolvers

### `src/graphql/runEffect.ts`

```ts
import { Effect } from "effect"
import { useContext } from "@gqloom/core/context"
import type { GraphQLContext } from "./context"
import type { AppEnv } from "../app/appLayer"

export const runEffect = <A, E>(
  eff: Effect.Effect<A, E, AppEnv>
): Promise<A> => {
  const { runtime, requestId } = useContext<GraphQLContext>()
  return runtime.runPromise(
    eff.pipe(
      Effect.annotateLogs({ requestId }),
      Effect.withLogSpan("graphql.resolver")
    )
  )
}
```

This is the unique “interpreter” morphism `Effect ⟶ Promise` at your GraphQL boundary.

---

## 4.8 GQLoom + Effect Schema usage (fix optionality; use `standardSchemaV1`)

### `src/resolvers/hello.ts`

```ts
import { query, resolver } from "@gqloom/core"
import { Schema } from "effect"
import { helloHandler } from "../handlers/hello"
import { runEffect } from "../graphql/runEffect"

const standard = Schema.standardSchemaV1

const HelloOut = standard(
  Schema.String.annotations({ title: "Hello" })
)

const NameArg = standard(
  Schema.optional(Schema.String).annotations({
    title: "name",
    description: "Name to greet"
  })
)

export const helloResolver = resolver({
  hello: query(HelloOut)
    .input({ name: NameArg })
    .resolve((args) => runEffect(helloHandler(args)))
})
```

This matches GQLoom’s recommended approach for Effect Schema integration and naming.

---

## 4.9 Schema weaving stays pure

### `src/graphql/schema.ts`

```ts
import { weave } from "@gqloom/core"
import { EffectWeaver } from "@gqloom/effect"
import { helloResolver } from "../resolvers/hello"

export const schema = weave(EffectWeaver, helloResolver)
```

---

## 4.10 Node HTTP server as a managed resource (Effect acquires/releases)

### `src/server/http.ts`

```ts
import { Effect } from "effect"
import { createServer, type Server } from "node:http"
import type { YogaServer } from "graphql-yoga"

export const listen = <Ctx>(
  yoga: YogaServer<Ctx, Ctx>,
  port: number
) =>
  Effect.acquireRelease(
    Effect.async<Server>((resume) => {
      const server = createServer(yoga)

      server.on("error", (err) => resume(Effect.fail(err)))
      server.listen(port, () => resume(Effect.succeed(server)))
    }),
    (server) =>
      Effect.async<void>((resume) => {
        server.close((err) =>
          err ? resume(Effect.fail(err)) : resume(Effect.succeed(void 0))
        )
      })
  )
```

---

## 4.11 Main program: obtain runtime once; start server; never return

### `src/app/Main.ts`

```ts
import { Effect } from "effect"
import { AppConfig } from "../config/AppConfig"
import { createYogaApp } from "../server/yoga"
import { listen } from "../server/http"
import type { AppEnv } from "./appLayer"

export const Main = Effect.scoped(
  Effect.gen(function* () {
    const { port } = yield* AppConfig
    const runtime = yield* Effect.runtime<AppEnv>()

    const yoga = createYogaApp(runtime)

    yield* listen(yoga, port)
    yield* Effect.logInfo(`GraphQL server running on http://localhost:${port}/graphql`)

    // keep process alive until interrupted; scoped finalizer closes server
    yield* Effect.never
  })
)
```

### `src/index.ts`

```ts
import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { appLayer } from "./app/appLayer"
import { Main } from "./app/Main"

NodeRuntime.runMain(
  Main.pipe(Effect.provide(appLayer))
)
```

Now there is:

* **one** runtime (captured from the running program),
* **zero** `runSync` runtime extraction,
* resolvers don’t need to be runtime-aware (they only use `runEffect`).

---

## 5. Answering your concrete question

### “I’m manually threading an effect runtime to resolvers; is that correct?”

It’s *not wrong*, but it’s not the cleanest structure for GQLoom+Yoga:

* Correct principle: you must interpret `Effect` into `Promise` *somewhere* at the GraphQL boundary (because GraphQL execution is ultimately promise/async driven).
* Better implementation: **do not thread the runtime as an explicit parameter**; instead use **GQLoom context injection** to access a runtime stored in Yoga context, and run effects via a single `runEffect` helper.

This gives you a clearer separation between:

* *specification* (Effects: pure programs with requirements),
* *interpretation* (runtime: execution).

---

## 6. Next upgrades (optional, but now straightforward)

1. **Request-scoped services** (auth, DB transaction, request logger fields):

   * Add `RequestContext` as an Effect service (Layer.succeed per request),
   * In `runEffect`, provide it via `Effect.provideService` or `Effect.provide(Layer.succeed(...))`.

2. **Centralized error mapping to GraphQL errors**:

   * In `runEffect`, wrap with `Effect.catchAllCause` and throw a `GraphQLError` with structured extensions.

3. **Schema best practices**:

   * Prefer `Schema.NullOr(X)` when the semantic is “nullable”, and `Schema.optional(X)` when the semantic is “field may be absent”.
   * Keep “defaulting” logic either in GraphQL arg defaults (if supported) or in handler/service (often simplest).

