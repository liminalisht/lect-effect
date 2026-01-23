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



------



According to a document from **January 22, 2026**, here are **concrete file/code changes + stepwise checklists** for each of the **7 refactors** in `angular-effect-refactor.md`, specialized to your current repo state (Angular app already in `apps/frontend`, domain extracted, GraphQL client + UiRuntime exist).

I’m going to treat each refactor as a **factorization of a dependency edge** in the “frontend effects” graph, i.e. we’re making the dependency category explicit: `UI → Store → DomainApi → GraphQLClient → Transport`, and we’ll ensure all arrows are *typed* and all effects live in the **Kleisli category** of `Effect`.

---

## Refactor 1 — Frontend config as an Effect service (Tag + Layer), sourced from Angular DI

### What you have now

`UiRuntime` hardcodes `GraphQLClientLive('/graphql')` inside the runtime layer definition, so config is not a first-class dependency the way `AppConfigService` is on backend.

### Target state

Add a minimal `FrontendConfigService` (Effect `Context.Tag`) and supply it from Angular DI once at bootstrap.

### Checklist

* [ ] Create `apps/frontend/src/app/core/config/frontend-config.ts`
* [ ] Create `apps/frontend/src/app/core/config/raw-frontend-config.token.ts`
* [ ] Provide `RAW_FRONTEND_CONFIG` in `apps/frontend/src/app/app.config.ts`
* [ ] (Optional but recommended for SSR correctness) Override `RAW_FRONTEND_CONFIG` in `app.config.server.ts` if you want a different server endpoint.

### New file: `apps/frontend/src/app/core/config/frontend-config.ts`

```ts
import { Context, Either, LogLevel, Schema } from 'effect';
import type { ParseError } from 'effect/ParseResult';

export const LogLevelNameSchema = Schema.Literal(
  'All',
  'Fatal',
  'Error',
  'Warning',
  'Info',
  'Debug',
  'Trace',
  'None',
);

export type LogLevelName = Schema.Schema.Type<typeof LogLevelNameSchema>;

export const RawFrontendConfigSchema = Schema.Struct({
  graphqlEndpoint: Schema.String,
  logLevel: LogLevelNameSchema,
});

export type RawFrontendConfig = Schema.Schema.Type<typeof RawFrontendConfigSchema>;

export type FrontendConfig = Readonly<{
  graphqlEndpoint: string;
  logLevel: LogLevel.LogLevel;
}>;

const logLevelFromName = (name: LogLevelName): LogLevel.LogLevel => {
  switch (name) {
    case 'All': return LogLevel.All;
    case 'Fatal': return LogLevel.Fatal;
    case 'Error': return LogLevel.Error;
    case 'Warning': return LogLevel.Warning;
    case 'Info': return LogLevel.Info;
    case 'Debug': return LogLevel.Debug;
    case 'Trace': return LogLevel.Trace;
    case 'None': return LogLevel.None;
  }
};

export const decodeFrontendConfigEither = (
  raw: unknown,
): Either.Either<FrontendConfig, ParseError> => {
  const decoded = Schema.decodeUnknownEither(RawFrontendConfigSchema)(raw);
  if (Either.isLeft(decoded)) {
    return decoded;
  }

  return Either.right({
    graphqlEndpoint: decoded.right.graphqlEndpoint,
    logLevel: logLevelFromName(decoded.right.logLevel),
  });
};

export class FrontendConfigService extends Context.Tag('FrontendConfigService')<
  FrontendConfigService,
  FrontendConfig
>() {}
```

### New file: `apps/frontend/src/app/core/config/raw-frontend-config.token.ts`

```ts
import { InjectionToken } from '@angular/core';
import type { RawFrontendConfig } from './frontend-config.js';

export const RAW_FRONTEND_CONFIG = new InjectionToken<RawFrontendConfig>(
  'RAW_FRONTEND_CONFIG',
);
```

### Modify: `apps/frontend/src/app/app.config.ts`

Add a provider for the raw config token (choose your endpoint policy; this keeps your existing proxy approach):

```ts
import { RAW_FRONTEND_CONFIG } from './core/config/raw-frontend-config.token.js';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: RAW_FRONTEND_CONFIG,
      useValue: {
        graphqlEndpoint: '/graphql',
        logLevel: 'Info',
      },
    },
    // ...existing providers...
  ],
};
```

---

## Refactor 2 — Install Effect logger layer into the frontend runtime

### What you have now

Frontend doesn’t provide an Effect logger layer; backend does (`Logger.minimumLogLevel(appConfig.logLevel)`).

### Target state

Add `FrontendLoggerLayer` depending on `FrontendConfigService`, and merge it into the runtime layer.

### Checklist

* [ ] Create `apps/frontend/src/app/core/logging/logger.layer.ts`
* [ ] Ensure UiRuntime’s `AppLayer` merges `FrontendLoggerLayer` (provided `FrontendConfigService`)
* [ ] (Optional) Replace any ad-hoc `console.log` with `Effect.log*` at the *effect boundary* (stores/services), not inside components.

### New file: `apps/frontend/src/app/core/logging/logger.layer.ts`

```ts
import { Effect, Layer, Logger } from 'effect';
import { FrontendConfigService } from '../config/frontend-config.js';

const program = Effect.gen(function* () {
  const cfg = yield* FrontendConfigService;
  return Logger.minimumLogLevel(cfg.logLevel);
});

export const FrontendLoggerLayer = Layer.unwrapEffect(program);
```

---

## Refactor 3 — Replace `Context.GenericTag` with `Context.Tag` (Tag-class style)

### What you have now

`GraphQLClientTag = Context.GenericTag<GraphQLClient>('GraphQLClient')`.

### Target state

Use the same style as backend: `export class X extends Context.Tag(...)<X, Service>() {}`. This makes the “service object classifier” explicit and uniform.

### Checklist

* [ ] Modify `apps/frontend/src/app/core/graphql/graphql-client.ts`
* [ ] Update all call-sites (`yield* GraphQLClientTag`) → (`yield* GraphQLClientService`)
* [ ] Update any type signatures in `UiRuntime` that mention the old env type.

### Modify: `apps/frontend/src/app/core/graphql/graphql-client.ts`

Replace the tag definition and update the Layer to provide the Tag-class:

```ts
import { Context, Effect, Layer } from 'effect';
import type { Json } from '../json/json.js';
import {
  GraphQLDecodeError,
  GraphQLHttpError,
  GraphQLResponseError,
  GraphQLTransportError,
} from './graphql-errors.js';
import { FrontendConfigService } from '../config/frontend-config.js';

export type GraphQLClientError =
  | GraphQLTransportError
  | GraphQLHttpError
  | GraphQLResponseError
  | GraphQLDecodeError;

export type GraphQLClient = {
  readonly request: <A extends Record<string, Json>>(
    doc: string,
    variables?: Record<string, Json>,
  ) => Effect.Effect<A, GraphQLClientError>;
};

export class GraphQLClientService extends Context.Tag('GraphQLClientService')<
  GraphQLClientService,
  GraphQLClient
>() {}

export const GraphQLClientLive: Layer.Layer<
  GraphQLClientService,
  never,
  FrontendConfigService
> = Layer.effect(
  GraphQLClientService,
  Effect.gen(function* () {
    const { graphqlEndpoint } = yield* FrontendConfigService;

    return GraphQLClientService.of({
      request: <A extends Record<string, Json>>(
        doc: string,
        variables?: Record<string, Json>,
      ) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: async () => fetch(graphqlEndpoint, {
              method: 'POST',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({ query: doc, variables }),
            }),
            catch: error => new GraphQLTransportError({ error }),
          });

          if (!response.ok) {
            const errorText = yield* Effect.tryPromise({
              try: () => response.text(),
              catch: error => new GraphQLDecodeError({ error }),
            });

            return yield* Effect.fail(new GraphQLHttpError({
              status: response.status,
              errorText,
            }));
          }

          const json = yield* Effect.tryPromise({
            try: async () => response.json() as unknown,
            catch: error => new GraphQLDecodeError({ error }),
          });

          if (typeof json !== 'object' || json === null) {
            return yield* Effect.fail(new GraphQLDecodeError({
              error: new Error('Response JSON was not an object'),
            }));
          }

          if ('errors' in json) {
            return yield* Effect.fail(new GraphQLResponseError({ response: json }));
          }

          return json as A;
        }),
    });
  }),
);
```

This also makes `GraphQLClientLive` depend on `FrontendConfigService`, instead of taking a hardcoded endpoint string (config becomes a morphism in the dependency graph, not a constant).

---

## Refactor 4 — Promote `hello` / `product` API modules into domain Effect services (interface/impl/layer)

### What you have now

You have free functions `greet(...)` and `createProductWithItems(...)` in `apps/frontend/src/api/*` that directly depend on `GraphQLClientTag`.

### Target state

For each domain API, define:

* `interface.ts` (Tag + types)
* `live.ts` (implementation)
* `layer.ts` (Layer wiring)

…and then stores depend on the Tag service, not on concrete functions.

### Checklist

* [ ] Move `apps/frontend/src/api/hello.api.ts` → `apps/frontend/src/app/api/hello/*`
* [ ] Move `apps/frontend/src/api/product.api.ts` → `apps/frontend/src/app/api/product/*`
* [ ] Update imports in stores to use the services
* [ ] Update runtime layer composition to include these API layers

### Create directory: `apps/frontend/src/app/api/hello/`

#### `hello.api.interface.ts`

```ts
import { Context, Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { GraphQLClientError } from '../../core/graphql/graphql-client.js';
import type { HelloResponse } from '@lect-effect/domain/hello';

export type HelloApiError = GraphQLClientError | ParseError;

export type HelloApi = {
  readonly greet: (name: unknown) => Effect.Effect<HelloResponse, HelloApiError>;
};

export class HelloApiService extends Context.Tag('HelloApiService')<
  HelloApiService,
  HelloApi
>() {}
```

#### `hello.api.live.ts`

```ts
import { Effect, Schema } from 'effect';
import { GraphQLClientService } from '../../core/graphql/graphql-client.js';
import { HelloApiService } from './hello.api.interface.js';
import {
  HelloInputSchema,
  HelloResponseSchema,
} from '@lect-effect/domain/hello';

const helloQuery = `
  query Hello($name: String!) {
    hello(name: $name)
  }
`;

export const helloApiLive = Effect.gen(function* () {
  const client = yield* GraphQLClientService;

  return HelloApiService.of({
    greet: (name: unknown) =>
      Effect.gen(function* () {
        const variables = yield* Schema.decodeUnknown(HelloInputSchema)({ name });
        const response = yield* client.request(helloQuery, variables);
        return yield* Schema.decodeUnknown(HelloResponseSchema)(response);
      }),
  });
});
```

#### `hello.api.layer.ts`

```ts
import { Layer } from 'effect';
import { HelloApiService } from './hello.api.interface.js';
import { helloApiLive } from './hello.api.live.js';

export const HelloApiLayer = Layer.effect(HelloApiService, helloApiLive);
```

### Create directory: `apps/frontend/src/app/api/product/`

#### `product.api.interface.ts`

```ts
import { Context, Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { GraphQLClientError } from '../../core/graphql/graphql-client.js';
import type {
  CreateProductWithItemsInput,
  ProductWithItems,
} from '@lect-effect/domain/product';

export type ProductApiError = GraphQLClientError | ParseError;

export type ProductApi = {
  readonly createProductWithItems: (
    input: unknown,
  ) => Effect.Effect<ProductWithItems, ProductApiError>;
};

export class ProductApiService extends Context.Tag('ProductApiService')<
  ProductApiService,
  ProductApi
>() {}
```

#### `product.api.live.ts`

```ts
import { Effect, Schema } from 'effect';
import { GraphQLClientService } from '../../core/graphql/graphql-client.js';
import { ProductApiService } from './product.api.interface.js';
import {
  CreateProductWithItemsInputSchema,
  ProductWithItemsSchema,
} from '@lect-effect/domain/product';

const createProductMutation = `
  mutation CreateProductWithItems($input: CreateProductWithItemsInput!) {
    createProductWithItems(input: $input) {
      product {
        id
        name
        description
      }
      items {
        id
        product_id
        pack_size
        price_cents
        created_at
        updated_at
      }
    }
  }
`;

const CreateProductWithItemsResultSchema = Schema.Struct({
  data: Schema.Struct({
    createProductWithItems: ProductWithItemsSchema,
  }),
});

export const productApiLive = Effect.gen(function* () {
  const client = yield* GraphQLClientService;

  return ProductApiService.of({
    createProductWithItems: (input: unknown) =>
      Effect.gen(function* () {
        const validated = yield* Schema.decodeUnknown(CreateProductWithItemsInputSchema)(input);

        // normalize (keep your current semantics)
        const normalized = {
          ...validated,
          product: {
            ...validated.product,
            description: validated.product.description ?? null,
          },
          items: validated.items.map(item => ({
            ...item,
            priceCents: item.priceCents ?? null,
          })),
        };

        const response = yield* client.request(createProductMutation, { input: normalized });
        const decoded = yield* Schema.decodeUnknown(CreateProductWithItemsResultSchema)(response);
        return decoded.data.createProductWithItems;
      }),
  });
});
```

#### `product.api.layer.ts`

```ts
import { Layer } from 'effect';
import { ProductApiService } from './product.api.interface.js';
import { productApiLive } from './product.api.live.js';

export const ProductApiLayer = Layer.effect(ProductApiService, productApiLive);
```

### Remove or repoint the old files

* [ ] Delete `apps/frontend/src/api/hello.api.ts` and `apps/frontend/src/api/product.api.ts`, **or** turn them into thin re-exports to the new services if you want a migration period.

---

## Refactor 5 — Fix store error types (stop `unknown`); store `Cause<E>` explicitly

### What you have now

Stores use `RemoteData<unknown, A>` and store `exit.cause` into `unknown`.

### Target state

Stores are `RemoteData<Cause.Cause<DomainError>, Value>`, so you retain:

* typed error coproducts (`GraphQLClientError ⊔ ParseError ⊔ …`)
* full cause trees (fail vs die, fiber interruptions, etc.)

### Checklist

* [ ] Update `HelloStore` state type and implementation
* [ ] Update `CreateProductStore` state type and implementation
* [ ] Update UI renderers to pretty-print causes (`Cause.pretty`) instead of JSON-dumping unknown

### Modify: `apps/frontend/src/app/features/hello/hello.store.ts`

```ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { Cause, Exit } from 'effect';
import { RemoteData } from '../../core/effect/remote-data.js';
import { UiRuntime } from '../../core/effect/ui-runtime.js';
import { HelloApiService, type HelloApiError } from '../../api/hello/hello.api.interface.js';

@Injectable()
export class HelloStore {
  private readonly runtime = inject(UiRuntime);

  private readonly state_ = signal<RemoteData<Cause.Cause<HelloApiError>, unknown>>(
    RemoteData.initial(),
  );

  readonly state = this.state_.asReadonly();

  readonly greeting = computed(() => {
    const s = this.state();
    return s._tag === 'Success' ? String((s.value as any).greeting ?? '') : '';
  });

  async greet(name: string): Promise<void> {
    this.state_.set(RemoteData.pending());

    const program = (input: unknown) =>
      HelloApiService.pipe(
        // service lookup is explicit dependency
        // then call method
        // (generator style is also fine; pick one style and standardize)
        // NOTE: Effect.flatMap is fine too; leaving as generator below would also be fine.
        // We'll use generator for consistency with your codebase.
        (svc) => svc.greet(input),
      );

    const exit = await this.runtime.runExit(program(name));

    this.state_.set(
      Exit.match(exit, {
        onFailure: cause => RemoteData.failure(cause),
        onSuccess: value => RemoteData.success(value),
      }),
    );
  }
}
```

> If you prefer generators (likely, given the rest of the repo), rewrite `program` as `Effect.gen(function*(){ const api = yield* HelloApiService; return yield* api.greet(name); })`.

### Modify: `apps/frontend/src/app/features/products/create-product.store.ts`

Change `RemoteData<unknown, ProductWithItems>` → `RemoteData<Cause.Cause<ProductApiError>, ProductWithItems>` and call the service instead of free function.

---

## Refactor 6 — Make stores slice-local (provided at the page boundary, not root)

### What you have now

`HelloStore` is `providedIn: 'root'`; that implies one global store instance and encourages accidental cross-feature coupling.

### Target state

A route/page is the **colimit** (composition point) that wires dependencies; stores live there, so every route activation yields a fresh store instance.

### Checklist

* [ ] Remove `providedIn: 'root'` from `HelloStore` (and any other feature store)
* [ ] Add `providers: [HelloStore]` to `hello.page.ts`
* [ ] Ensure child components inject the store from the page injector (not root)

### Modify: `apps/frontend/src/app/features/hello/hello.store.ts`

Change:

```ts
@Injectable({ providedIn: 'root' })
```

to:

```ts
@Injectable()
```

### Modify: `apps/frontend/src/app/features/hello/hello.page.ts`

Add a `providers` array:

```ts
@Component({
  // ...
  providers: [HelloStore],
})
export class HelloPage { /* ... */ }
```

This matches what you already do for product creation (`providers: [CreateProductStore]`).

---

## Refactor 7 — Widen `UiRuntime` environment (stop pinning it to `GraphQLClient` only)

### What you have now

`UiRuntime.runExit` is typed to effects requiring `GraphQLClient` only. That prevents the “store → domain service” refactor from being type-directed end-to-end.

### Target state

Define an `AppEnv` union of all services your runtime provides, and type `runExit` against that environment.

### Checklist

* [ ] Create `apps/frontend/src/app/core/effect/app-layer.ts` to build a single `AppLayer` (like backend)
* [ ] Modify `UiRuntime` to build `ManagedRuntime` from `makeAppLayer(...)`
* [ ] Change `runExit` signature to accept `Effect<_,_,R>` where `R extends AppEnv`
* [ ] Merge `FrontendConfigService`, `FrontendLoggerLayer`, `GraphQLClientLive`, `HelloApiLayer`, `ProductApiLayer` into AppLayer

### New file: `apps/frontend/src/app/core/effect/app-layer.ts`

```ts
import { Layer } from 'effect';

import type { FrontendConfig } from '../config/frontend-config.js';
import { FrontendConfigService } from '../config/frontend-config.js';

import { FrontendLoggerLayer } from '../logging/logger.layer.js';

import { GraphQLClientLive, GraphQLClientService } from '../graphql/graphql-client.js';

import { HelloApiLayer } from '../../api/hello/hello.api.layer.js';
import { HelloApiService } from '../../api/hello/hello.api.interface.js';

import { ProductApiLayer } from '../../api/product/product.api.layer.js';
import { ProductApiService } from '../../api/product/product.api.interface.js';

export type AppEnv =
  | FrontendConfigService
  | GraphQLClientService
  | HelloApiService
  | ProductApiService;

export const makeAppLayer = (cfg: FrontendConfig): Layer.Layer<AppEnv> => {
  const configLayer = Layer.succeed(FrontendConfigService, cfg);

  const loggerLayer = FrontendLoggerLayer.pipe(Layer.provide(configLayer));

  const gqlLayer = GraphQLClientLive.pipe(Layer.provide(configLayer));

  const helloLayer = HelloApiLayer.pipe(Layer.provide(gqlLayer));
  const productLayer = ProductApiLayer.pipe(Layer.provide(gqlLayer));

  return Layer.mergeAll(configLayer, loggerLayer, gqlLayer, helloLayer, productLayer);
};
```

### Modify: `apps/frontend/src/app/core/effect/ui-runtime.ts`

Replace the hardcoded layer with `makeAppLayer(decode(raw))` and widen `runExit`:

```ts
import { DestroyRef, inject, Injectable } from '@angular/core';
import { Effect, Either, Exit, ManagedRuntime } from 'effect';

import { RAW_FRONTEND_CONFIG } from '../config/raw-frontend-config.token.js';
import { decodeFrontendConfigEither } from '../config/frontend-config.js';
import { makeAppLayer, type AppEnv } from './app-layer.js';

@Injectable({ providedIn: 'root' })
export class UiRuntime {
  private readonly destroyRef = inject(DestroyRef);
  private readonly rawConfig = inject(RAW_FRONTEND_CONFIG);

  private readonly runtime = (() => {
    const decoded = decodeFrontendConfigEither(this.rawConfig);
    if (Either.isLeft(decoded)) {
      // hard-fail: config is a bootstrap invariant
      throw decoded.left;
    }
    return ManagedRuntime.make(makeAppLayer(decoded.right));
  })();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.runtime.dispose();
    });
  }

  runExit = <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<Exit.Exit<A, E>> => this.runtime.runPromiseExit(effect);

  runPromise = <A, E, R extends AppEnv>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<A> => this.runtime.runPromise(effect);
}
```

Now `UiRuntime` is the unique “interpreter” of the effectful DSL provided by your services.

---

# Two “missing” consistency points you called out (fold into the above)

These weren’t separate numbered refactors in `angular-effect-refactor.md`, but your bullet list asked for them explicitly. Here is how to implement them **without growing the abstraction surface area**.

## A) “We only sometimes use Effect schemas; some ad hoc validation exists”

**Rule:** *Every boundary is decoded exactly once.*
Concretely:

* Network boundary: decode GraphQL payloads using shared schemas (you already do this; keep it inside `ProductApiService` / `HelloApiService`).
* Form boundary: decode user input using field schemas (keep in `core/forms/schema-field.ts`, which you already have).
* UI components never “validate”; they only display `Either`/`RemoteData`.

**Checklist**

* [ ] Ensure every API service method takes `unknown` (boundary) and immediately `Schema.decodeUnknown(...)`.
* [ ] Ensure every API service method decodes response via `Schema.decodeUnknown(...)`.
* [ ] For each form field, use `schemaField(schema, initialRaw)`; eliminate hand-written validators.
* [ ] If you need cross-field validation, define a *record schema* at the form level and decode the assembled draft object.

## B) “Page vs component are coupled”

You already do the right thing for products: `CreateProductPage` is the wiring point and has two presentational components.
For `Hello`, do the same when you feel it’s worth it:

* Page = provides store + wires signals + side effects
* Components = pure views: `inputs` + `outputs` only

This is the Angular analogue of keeping morphisms in the Kleisli category out of your “object-only” category.

---

## Suggested implementation order (minimize breakage)

If you want the refactors to stay “compiling at each commit”, do them in this order:

1. Refactor 1 (config Tag + DI token)
2. Refactor 2 (logger layer)
3. Refactor 3 (GraphQLClient Tag-class)
4. Refactor 7 (AppLayer + UiRuntime widen) — this unlocks domain services cleanly
5. Refactor 4 (HelloApi/ProductApi services)
6. Refactor 5 (store error typing)
7. Refactor 6 (slice-local stores)

That ordering matches the dependency graph: you can’t sensibly type domain services until the runtime env is widened.

---

If you want, I can also give you a **“grep-driven migration checklist”** (exact search strings + replacements) for each step (e.g. `GraphQLClientTag` → `GraphQLClientService`, `../../../api/product.api.js` → service injection, etc.), but the above is enough to implement the full refactor with small, verifiable commits.
