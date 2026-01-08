According to a document from January 8, 2026, the “grossness” you’re seeing is largely the symptom of **not letting GQLoom carry request context**, so you fall back to manually threading `(payload as …).context` and then manually threading an `Effect` runtime through that. Concretely:

* Your resolvers currently do a forced projection `payload.context : unknown → GraphQLContext` with lots of partial/undefined checks and casts.
* `runEffect` is forced to accept an optional `ctx` and then hunt for a runtime, failing at runtime if it’s missing.
* `GraphQLContext` and `runEffect` are specialized to `ConfigService`, so the moment you add a second service you’ll either (a) widen everything everywhere, or (b) start proliferating “variants”.

Below is an architecture that fixes all of this by making the “ambient environment” explicit once (via Layers) and then using **GQLoom’s AsyncLocalStorage context** as the single bridge from GraphQL-land to Effect-land.

---

## 1) Stop threading `payload.context`: enable GQLoom async context once

GQLoom’s docs are explicit: to use `useContext()` “from anywhere within the resolver”, you must pass `asyncContextProvider` to `weave` (it’s effectively global middleware). Otherwise you need to reach for `payload.context` and cast it.

Right now your schema is:

```ts
export const schema = weave(EffectWeaver, ...makeResolvers())
```



Change it to:

```ts
// src/graphql/schema.ts
import { weave } from "@gqloom/core"
import { asyncContextProvider } from "@gqloom/core/context"
import { EffectWeaver } from "@gqloom/effect"
import { makeResolvers } from "./resolvers"

export const schema = weave(EffectWeaver, asyncContextProvider, ...makeResolvers())
```

This single change makes `useContext<GraphQLContext>()` *the* canonical way to get your request context in resolvers/handlers/middleware, so you can delete the entire “payload casting” pattern.

---

## 2) Make the runtime environment be the coproduct of *all* services (AppEnv), not `ConfigService`

Right now:

* `GraphQLContext.runtime: Runtime<ConfigService>`
* `runEffect: Effect<_,_,ConfigService> → Promise<_>`
* `listen(schema, runtime: Runtime<ConfigService>, …)`

This is exactly what will hurt you as soon as you add `DbService`, `AuthService`, etc.

### The pattern to adopt

Define a single alias `AppEnv` (a union of service Tags). This is the “ambient topos of dependencies” your runtime will interpret in:

```ts
// src/services/index.ts
export { ConfigService } from "./config"

// As you add services, extend this union:
export type AppEnv = ConfigService // | DbService | AuthService | ...
```

Now update the GraphQL context to carry a runtime for **AppEnv**:

```ts
// src/graphql/context.ts
import type { Runtime } from "effect"
import type { YogaInitialContext } from "graphql-yoga"
import type { AppEnv } from "../services"

export type GraphQLContext = YogaInitialContext & {
  readonly runtime: Runtime.Runtime<AppEnv>
}
```

Why this scales:

* Each handler can still demand only what it needs: `Effect<A, E, DbService | ConfigService>`.
* A runtime for `AppEnv` can run any computation whose requirements are a **sub-union** of `AppEnv` (categorically: you have a canonical inclusion `R ↪ AppEnv`, and `Effect` is covariant in `R` in the way you want operationally).

---

## 3) Make `runEffect` total(ish) and *not* service-specific

Once `asyncContextProvider` is enabled, you no longer need to pass `ctx` at all; you can just read the context via `useContext`.

Also: `runEffect` should not mention `ConfigService` directly; it should mention `AppEnv`.

```ts
// src/runEffect.ts
import { Runtime, type Effect } from "effect"
import { useContext } from "@gqloom/core/context"
import type { GraphQLContext } from "./graphql/context"
import type { AppEnv } from "./services"

/**
 * Natural transformation: Effect<_,_,AppEnv> ~> Promise<_>
 *
 * Because Effect is usable with sub-requirements, you can pass an Effect whose
 * requirements are any sub-union of AppEnv.
 */
export const runEffect = <A, E>(eff: Effect.Effect<A, E, AppEnv>): Promise<A> => {
  const ctx = useContext<GraphQLContext>()
  if (!ctx?.runtime) {
    return Promise.reject(new Error("Runtime missing from GraphQL context"))
  }
  return Runtime.runPromise(ctx.runtime, eff)
}
```

Now `runEffect` does not need to be replicated when you add services; only `AppEnv` evolves.

---

## 4) Resolvers become a pure boundary: `resolve = runEffect ∘ handler`

With (1) and (3), your resolver drops to the mathematically clean composite:

```ts
// src/graphql/resolvers.ts
import { query, resolver } from "@gqloom/core"
import * as handlers from "../domain/handlers"
import * as schemas from "../domain/schemas"
import { runEffect } from "../runEffect"

export const makeResolvers = () => {
  const helloResolver = resolver({
    hello: query(schemas.HelloResponseStandard)
      .input(schemas.NameInputStandard)
      .resolve((args) => runEffect(handlers.helloHandler(args))),
  })

  return [helloResolver]
}
```

This removes every one of the concerns you listed in the snippet:

* no `payload` plumbing
* no `unknown`/`undefined` casts
* no runtime-threading in each resolver
* no specialization to `ConfigService`

(Compare to your current `.resolve((args, payload) => runEffect(... payload.context as …))` shape.)

---

## 5) Expose Yoga itself as an Effect value (this is the testing hook you want)

You said: “our program doesn’t expose a convenient hook to get the yoga server itself, so that we can use it to test.”

The right move is to factor your current `listen(schema, runtime, port)` into two maps:

1. **build the Yoga instance** (pure-ish, no port, no socket)
2. **acquire/release the Node HTTP server** (the resourceful edge)

And then export (1) for tests.

GraphQL Yoga explicitly supports request injection via `yoga.fetch(...)` (no actual socket), which is ideal for tests.

### Build Yoga (export this)

```ts
// src/graphql/yoga.ts
import { Effect } from "effect"
import { createYoga, type YogaServerInstance } from "graphql-yoga"
import type { AppEnv } from "../services"
import type { GraphQLContext } from "./context"
import { schema } from "./schema"

export const makeYoga: Effect.Effect<YogaServerInstance<GraphQLContext>, never, AppEnv> =
  Effect.gen(function* () {
    const runtime = yield* Effect.runtime<AppEnv>()
    return createYoga<GraphQLContext>({
      schema,
      context: (initial) => ({ ...initial, runtime }),
    })
  })
```

### Listen (resource boundary)

```ts
// src/graphql/server.ts
import { Effect } from "effect"
import { createServer, type Server } from "node:http"
import type { YogaServerInstance } from "graphql-yoga"
import { ServerStartError } from "./errors"
import type { GraphQLContext } from "./context"

export const listen = (
  yoga: YogaServerInstance<GraphQLContext>,
  port: number
) =>
  Effect.acquireRelease(
    Effect.async<Server, ServerStartError>((resume, signal) => {
      const server = createServer(yoga)

      const onError = (error: unknown) =>
        resume(Effect.fail(new ServerStartError({ error })))

      server.once("error", onError)
      server.listen(port, () => {
        server.off("error", onError)
        resume(Effect.succeed(server))
      })

      // Interrupt safety: if the fiber is interrupted, close the server.
      const onAbort = () => server.close(() => undefined)
      if (signal.aborted) onAbort()
      signal.addEventListener("abort", onAbort)

      return Effect.sync(() => {
        signal.removeEventListener("abort", onAbort)
        server.off("error", onError)
        server.close(() => undefined)
      })
    }),
    (server) =>
      Effect.async<void>((resume) => {
        server.close(() => resume(Effect.void))
      })
  )
```

Your earlier instinct about `acquireRelease` is correct: a listening socket is a resource, and `acquireRelease` is the bracket that makes its lifetime explicit and interruption-safe.

### Main program now has a testable shape

```ts
// src/index.ts
import "dotenv/config"
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { AppLayer } from "./layers/app"
import { ConfigService, type AppEnv } from "./services"
import { makeYoga } from "./graphql/yoga"
import { listen } from "./graphql/server"

const program: Effect.Effect<never, unknown, AppEnv> = Effect.scoped(
  Effect.gen(function* () {
    const { port } = yield* ConfigService
    const yoga = yield* makeYoga
    yield* listen(yoga, port)
    yield* Effect.logInfo(`Server is running on http://localhost:${port}/graphql`)
    return yield* Effect.never
  })
)

NodeRuntime.runMain(program.pipe(Effect.provide(AppLayer)))
```

---

## 6) Testing becomes trivial: `makeYoga` + `yoga.fetch`

Because you exported `makeYoga`, a test can run it with a test Layer and then call `yoga.fetch` (which Yoga documents as an HTTP injection mechanism).

Sketch:

```ts
import { Effect, Layer, LogLevel } from "effect"
import { makeYoga } from "../src/graphql/yoga"
import { ConfigService, Port } from "../src/services/config"
import { AppLayer } from "../src/layers/app"

// Example: override config for tests (or build a dedicated TestAppLayer)
const TestConfig = Layer.succeed(ConfigService, { port: Port(0), logLevel: LogLevel.None })
const TestLayer = AppLayer.pipe(Layer.provide(TestConfig)) // or rebuild AppLayer for tests cleanly

const yoga = await Effect.runPromise(makeYoga.pipe(Effect.provide(TestLayer)))

const res = await yoga.fetch("http://test/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: `query { hello(input: { name: "Ada" }) { greeting } }` }),
})
const json = await res.json()
```

No server, no ports, no teardown races.

---

## 7) Optional services and mocking don’t infect types: use `Effect.serviceOption`

When you want a resolver/handler to *optionally* use some service, do **not** put that service in the requirement union and then try to “sometimes provide it”.

Effect already gives you the canonical construction: `Effect.serviceOption(Tag)` returns an `Option<Service>` and (crucially) does **not** add the service to the requirement type.

So in a handler:

```ts
import { Effect, Option } from "effect"
import { Analytics } from "../services/analytics"

export const doThing = Effect.gen(function* () {
  const maybeAnalytics = yield* Effect.serviceOption(Analytics)
  if (Option.isSome(maybeAnalytics)) {
    yield* maybeAnalytics.value.track("did-thing")
  }
})
```

This is exactly how you avoid “optional availability” turning into architectural pressure on `GraphQLContext` / `runEffect`.

---

## 8) Layer hygiene: keep dependencies out of service *interfaces*

You’re already doing the right thing by having `LoggerLayer` *depend* on `ConfigService` but not leak that dependency into some “LoggerService API”. This is a core Effect best practice: dependencies belong in Layers (constructors), not in the service surface.

Your current Layers are already close:

* `ConfigLayer` constructs `ConfigService` from env vars
* `LoggerLayer` reads `ConfigService` then returns `Logger.minimumLogLevel(logLevel)`
* `AppLayer` merges them and wires the dependency via `Layer.provide(ConfigLayer)`

Once you switch everything else to depend on `AppEnv` rather than `ConfigService`, adding a `DbLayer` or `AuthLayer` is just extending this “wiring diagram”.

---

## 9) Answering your direct question about “threading runtime to resolvers”

* **Threading a runtime through every resolver manually is not the pattern you want.**
* **Threading it once into Yoga context, and then accessing it via `useContext` is exactly the intended pattern in Node**, *provided* you enable `asyncContextProvider` in `weave`.

In other words: store the runtime once in the request context (Yoga), and treat `runEffect` as the unique interpreter from the Effect world to the Promise world.

---

If you implement just the three moves below, your architecture becomes stable under extension:

1. `weave(…, asyncContextProvider, …)`
2. introduce `AppEnv` and make `GraphQLContext.runtime: Runtime<AppEnv>`
3. export `makeYoga` and test via `yoga.fetch`

Everything else (new services, mocks, optionality, request-scoped concerns like dataloaders) then becomes a matter of adding morphisms (Layers) and composing them, rather than rewriting your resolver boundary each time.
