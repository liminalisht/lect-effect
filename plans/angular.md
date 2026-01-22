Below is a concrete Angular architecture that (i) keeps *effects* at a single boundary, (ii) treats UI state as a small algebra of **signals** (a presheaf of values over “time / interactions”), and (iii) reuses your existing **Effect Schemas** as the canonical runtime contract.

I’ll ground the examples in what your backend actually exposes: you have GraphQL operations like `greet`, `listItems`, `createItem`, `listProducts`, `createProductWithItems`, `getProductWithItems`, etc. (via handler `key`s), and your domain already uses Effect Schemas with snake_case fields like `pack_size`. I’m going to lean into that instead of inventing mappings.

I’ll also deliberately **avoid** “Angular state management frameworks” and keep RxJS usage at ~0 unless you explicitly want it.



---

## Non‑negotiable invariants

Think of this as carving the category of your frontend into a pure subcategory plus one Kleisli boundary:

1. **Components are pure** (up to event handlers):
   They read signals and render; they do not execute effects, do not talk to fetch/GraphQL, do not own “business state”.

2. **Stores are the only place where effects are executed**:
   A store is an injectable *algebra*:

   * observables of state = `Signal<A>`
   * commands = methods that *run* an `Effect` and write results to signals.

3. **API is typed twice**:

   * compile-time: TypeScript types (optional, via GraphQL codegen)
   * runtime: **Effect Schema decoding** of responses + validation of inputs

4. **Zoneless + signals + OnPush everywhere**:

   * You opt into Angular’s zoneless change detection to avoid implicit dependency edges. Angular documents zoneless mode and the `provideZonelessChangeDetection()` provider for this purpose. ([Angular][1])
   * OnPush is an additional “smallness” constraint: it forces updates to be explicit (signals already are).

5. **Errors are first-class values**:
   Model them as a small coproduct (tagged union). No “stringly typed” global error handling.

---

## Key decisions (and why)

### 1) Angular configuration: **standalone + zoneless**

Use standalone components and `bootstrapApplication`, and opt into zoneless change detection:

* `provideZonelessChangeDetection()` turns off Zone.js-driven implicit propagation. ([Angular][1])
* Signals then become the explicit morphisms that trigger recomputation.

### 2) State management: **one store per route/feature**

No NgRx. No global singleton store unless you actually have global state.

Route-local stores give you:

* local reasoning (small dependency graph),
* easy tests (construct store with mocked runtime),
* automatic lifecycle boundaries (route destroyed ⇒ store gone).

### 3) Effects runtime: **ManagedRuntime + Layer**

Use Effect’s `ManagedRuntime.make(layer)` so your “DI graph” is literally a `Layer`, i.e. a compositional object you can swap in tests. `ManagedRuntime` is designed exactly for “edge execution” and supports `runPromiseExit`. ([Effect TS][2])

### 4) GraphQL client: **minimal fetch + Schema decode**

I recommend **not** adopting Apollo unless you truly need normalized caching + pagination policies. It is a large implicit system.

Instead:

* keep GraphQL as “RPC over HTTP”
* decode results with Effect Schemas (your canonical contract)
* if you later want caching, add it in *stores* (as explicit maps/signals), not as a hidden client policy layer.

GraphQL codegen is optional. It’s a *left adjoint* that gives you compile-time witnesses that your queries type-check against the schema; it doesn’t have to define runtime behavior.

(If you do want codegen later: GraphQL Code Generator supports generating typed operations / client code. ([The Guild][3]))

### 5) Testing: **Vitest + fast-check + @effect/vitest**

Angular now documents migrating to Vitest. ([Angular][4])
This aligns with your backend approach (Vitest + fast-check + `@effect/vitest`) and keeps property-based testing symmetric across front/back.

---

## Proposed folder structure

This mirrors your backend layering (domain → handlers/services) but adapted for Angular:

```
apps/frontend/src/app/
  core/
    effect/
      ui-runtime.ts        // ManagedRuntime boundary
      remote-data.ts       // typed async state algebra
    graphql/
      graphql-client.ts    // Effect service tag + live Layer
      graphql-errors.ts
  api/
    hello.api.ts
    item.api.ts
    product.api.ts
  features/
    products/
      products.store.ts
      products.page.ts
    items/
      items.store.ts
      items.page.ts
    hello/
      hello.store.ts
      hello.page.ts
  app.routes.ts
  app.config.ts
  app.component.ts
  main.ts
```

**Strong rule:** `features/**` may depend on `api/**` and `core/**`, but `api/**` must not depend on `features/**`.

---

## Concrete code skeleton

### `main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => {
  // keep this brutally simple; use Effect logging later if desired
  console.error(err);
});
```

### `app.config.ts` (zoneless + routing)

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideZonelessChangeDetection(), // explicit: no Zone.js propagation
  ],
};
```

`provideZonelessChangeDetection()` is the documented mechanism for zoneless Angular. ([Angular][1])

### `core/effect/remote-data.ts` (explicit async state)

This is your “state object classifier” for async computations:

```ts
export type RemoteData<E, A> =
  | { readonly _tag: 'Initial' }
  | { readonly _tag: 'Loading' }
  | { readonly _tag: 'Failure'; readonly error: E }
  | { readonly _tag: 'Success'; readonly value: A };

export const RemoteData = {
  initial: <E, A>(): RemoteData<E, A> => ({ _tag: 'Initial' }),
  loading: <E, A>(): RemoteData<E, A> => ({ _tag: 'Loading' }),
  failure: <E, A>(error: E): RemoteData<E, A> => ({ _tag: 'Failure', error }),
  success: <E, A>(value: A): RemoteData<E, A> => ({ _tag: 'Success', value }),
} as const;
```

### `core/graphql/graphql-errors.ts`

```ts
import { Data } from 'effect';

export class GraphQLTransportError extends Data.TaggedError('GraphQLTransportError')<{
  readonly cause: unknown;
}> {}

export class GraphQLHttpError extends Data.TaggedError('GraphQLHttpError')<{
  readonly status: number;
  readonly body: unknown;
}> {}

export class GraphQLResponseError extends Data.TaggedError('GraphQLResponseError')<{
  readonly errors: readonly unknown[];
}> {}

export type FrontendApiError =
  | GraphQLTransportError
  | GraphQLHttpError
  | GraphQLResponseError;
```

### `core/graphql/graphql-client.ts` (Effect service + Layer)

```ts
import { Context, Effect, Layer } from 'effect';
import {
  GraphQLHttpError,
  GraphQLResponseError,
  GraphQLTransportError,
} from './graphql-errors';

export type Json =
  | null
  | boolean
  | number
  | string
  | readonly Json[]
  | { readonly [k: string]: Json };

type GraphQLResponse = {
  readonly data?: Json;
  readonly errors?: readonly unknown[];
};

export class GraphQLClient extends Context.Tag('ui/GraphQLClient')<
  GraphQLClient,
  {
    readonly request: (
      query: string,
      variables?: Record<string, Json>,
    ) => Effect.Effect<Json, GraphQLTransportError | GraphQLHttpError | GraphQLResponseError>;
  }
>() {}

export const GraphQLClientLive = (endpoint: string): Layer.Layer<GraphQLClient> =>
  Layer.succeed(
    GraphQLClient,
    GraphQLClient.of({
      request: (query, variables) =>
        Effect.tryPromise({
          try: async () => {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ query, variables }),
            });

            const body = (await res.json()) as GraphQLResponse;

            if (!res.ok) {
              throw new GraphQLHttpError({ status: res.status, body });
            }
            if (body.errors && body.errors.length > 0) {
              throw new GraphQLResponseError({ errors: body.errors });
            }
            return body.data ?? null;
          },
          catch: (cause) => {
            // preserve tagged errors if we threw them explicitly
            if (
              cause instanceof GraphQLHttpError ||
              cause instanceof GraphQLResponseError
            ) {
              return cause;
            }
            return new GraphQLTransportError({ cause });
          },
        }),
    }),
  );
```

This is intentionally “small”: the only moving parts are `fetch`, explicit HTTP failure, explicit GraphQL error array, and a `Json` universe.

### `core/effect/ui-runtime.ts` (the single “edge”)

```ts
import { Injectable } from '@angular/core';
import { Effect, Exit, Layer, ManagedRuntime } from 'effect';
import { GraphQLClient, GraphQLClientLive } from '../graphql/graphql-client';

@Injectable({ providedIn: 'root' })
export class UiRuntime {
  // Replace with environment config / injection token as needed
  private readonly endpoint = '/graphql';

  private readonly runtime = ManagedRuntime.make(
    Layer.mergeAll(
      GraphQLClientLive(this.endpoint),
      Layer.empty, // space for logging, auth, etc
    ),
  );

  runExit<A, E>(
    eff: Effect.Effect<A, E, GraphQLClient>,
  ): Promise<Exit.Exit<A, E>> {
    return this.runtime.runPromiseExit(eff);
  }
}
```

Why `ManagedRuntime`: it is built to run effects at the program edge, and `runPromiseExit` gives you an `Exit` value rather than throwing. ([Effect TS][2])

---

## API layer: reuse your Effect Schemas as decoders

Your backend already defines canonical schemas such as:

* `itemSchema` and `createItemInputSchema` using `pack_size`
* product operations like `listProducts`, `createProductWithItems`, etc.

So the frontend API should:

1. call GraphQL, obtaining `Json`
2. decode `Json` into domain types using **the same schemas**.

Example: `api/product.api.ts`

```ts
import { Effect, Schema } from 'effect';
import { GraphQLClient } from '../core/graphql/graphql-client';
import { productSchema } from '../../../src/domain/product/product'; // ideally: shared package
import { productWithItemsSchema } from '../../../src/domain/product/productWithItems';
import { createProductWithItemsInputSchema } from '../../../src/domain/product/createProductWithItemsInput';

const ListProductsResponse = Schema.Struct({
  listProducts: Schema.Array(productSchema),
});

export const listProducts = Effect.gen(function* () {
  const gql = yield* GraphQLClient;
  const data = yield* gql.request(/* GraphQL */ `
    query ListProducts {
      listProducts { id description }
    }
  `);

  const decoded = yield* Schema.decodeUnknown(ListProductsResponse)(data);
  return decoded.listProducts;
});

const CreateProductWithItemsResponse = Schema.Struct({
  createProductWithItems: productWithItemsSchema,
});

export const createProductWithItems = (input: unknown) =>
  Effect.gen(function* () {
    // validate *before* sending
    const validated = yield* Schema.decodeUnknown(createProductWithItemsInputSchema)(input);

    const gql = yield* GraphQLClient;
    const data = yield* gql.request(
      /* GraphQL */ `
        mutation CreateProductWithItems(
          $product: CreateProductWithItemsProductInput!
          $items: [CreateItemInput!]!
        ) {
          createProductWithItems(product: $product, items: $items) {
            product { id description }
            items { id description pack_size }
          }
        }
      `,
      {
        // GraphQL expects args `product` and `items` (isomorphic to your struct)
        product: validated.product as any,
        items: validated.items as any,
      },
    );

    const decoded = yield* Schema.decodeUnknown(CreateProductWithItemsResponse)(data);
    return decoded.createProductWithItems;
  });
```

Notes:

* I accept `unknown` as input to make the validation boundary explicit (you’ll pass the form model value).
* The schemas guarantee runtime compatibility; if the backend schema changes, you fail loudly and locally with a parse error rather than producing nonsense.

---

## Store layer: signals + explicit commands

Example: `features/products/products.store.ts`

```ts
import { Injectable, signal } from '@angular/core';
import { Exit } from 'effect';
import { RemoteData } from '../../core/effect/remote-data';
import { UiRuntime } from '../../core/effect/ui-runtime';
import { type FrontendApiError } from '../../core/graphql/graphql-errors';
import * as ProductApi from '../../api/product.api';
import type { Product } from '../../../../src/domain/product/product';
import type { ProductWithItems } from '../../../../src/domain/product/productWithItems';

@Injectable()
export class ProductsStore {
  private readonly rt: UiRuntime;

  // local state = signals
  readonly products = signal<RemoteData<FrontendApiError | unknown, readonly Product[]>>(
    RemoteData.initial(),
  );

  readonly lastCreated = signal<RemoteData<FrontendApiError | unknown, ProductWithItems>>(
    RemoteData.initial(),
  );

  // epoch to prevent stale overwrites (a “latest-wins” semiring)
  private productsEpoch = 0;

  constructor(rt: UiRuntime) {
    this.rt = rt;
  }

  loadProducts(): void {
    const epoch = ++this.productsEpoch;
    this.products.set(RemoteData.loading());

    void this.rt.runExit(ProductApi.listProducts).then((ex) => {
      // stale response? discard
      if (epoch !== this.productsEpoch) return;

      if (Exit.isSuccess(ex)) {
        this.products.set(RemoteData.success(ex.value));
      } else {
        // ex.cause contains typed failures + defects; keep it explicit
        this.products.set(RemoteData.failure(ex.cause as any));
      }
    });
  }

  createProductWithItems(input: unknown): void {
    this.lastCreated.set(RemoteData.loading());

    void this.rt.runExit(ProductApi.createProductWithItems(input)).then((ex) => {
      if (Exit.isSuccess(ex)) {
        this.lastCreated.set(RemoteData.success(ex.value));
        // optional: refresh list
        this.loadProducts();
      } else {
        this.lastCreated.set(RemoteData.failure(ex.cause as any));
      }
    });
  }
}
```

No RxJS. No magic. The only “impure” thing is calling `runExit` and writing signals.

---

## Component layer: pure rendering + event wiring

`features/products/products.page.ts`

```ts
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ProductsStore } from './products.store';

@Component({
  standalone: true,
  selector: 'app-products-page',
  providers: [ProductsStore], // route-local store instance
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Products</h1>

    <button type="button" (click)="store.loadProducts()">Reload</button>

    @if (vm()._tag === 'Initial') {
      <p>Not loaded.</p>
    } @else if (vm()._tag === 'Loading') {
      <p>Loading…</p>
    } @else if (vm()._tag === 'Failure') {
      <pre>{{ vm().error | json }}</pre>
    } @else {
      <ul>
        @for (p of vm().value; track p.id) {
          <li>#{{ p.id }} — {{ p.description }}</li>
        }
      </ul>
    }
  `,
})
export class ProductsPage {
  readonly store: ProductsStore;
  readonly vm: () => ReturnType<ProductsStore['products']>;

  constructor(store: ProductsStore) {
    this.store = store;

    // computed view-model if you want to enrich/derive later
    const vmSig = computed(() => this.store.products());
    this.vm = () => vmSig();
  }
}
```

This uses Angular’s new control flow (`@if`, `@for`) which pairs very cleanly with signals.

---

## Form validation without Angular Forms “frameworkiness”

You can model a form as:

* a signal of raw input `Signal<unknown>` (or structured but untrusted)
* a computed `Signal<Either<ParseError, A>>` via `Schema.decodeUnknown(schema)`

This is literally the subobject classifier story: “which inputs are inhabited by well-typed values?”

Sketch:

```ts
import { computed, signal } from '@angular/core';
import { Effect, Either, Schema } from 'effect';
import { createProductWithItemsInputSchema } from '../../../../src/domain/product/createProductWithItemsInput';

const raw = signal<unknown>({ product: { description: null }, items: [] });

const decoded = computed(() =>
  Effect.runSync(
    Schema.decodeUnknown(createProductWithItemsInputSchema)(raw()).pipe(Effect.either),
  ),
);

// decoded(): Either<ParseError, CreateProductWithItemsInput>
```

Then “submit” is simply: if `Either.isRight(decoded())` call the store command with the raw value (or the validated value).

No Angular FormControl graph unless you want it.

---

## Testing strategy

### Unit tests (stores + API) with Vitest + fast-check

Angular documents Vitest migration, so this fits long-term. ([Angular][4])
Your property-based tooling stays the same as backend: `Arbitrary.make(schema)` and fast-check. (You already do this for schemas like `packSizeSchema` etc.)

A store test doesn’t need Angular at all:

```ts
import { describe, expect, it } from 'vitest';
import { Effect, Exit, Layer } from 'effect';
import { UiRuntime } from '../../core/effect/ui-runtime';
import { ProductsStore } from './products.store';
import { GraphQLClient } from '../../core/graphql/graphql-client';

// a minimal fake runtime: runs provided effects with a test layer
const makeTestRuntime = (layer: Layer.Layer<GraphQLClient>) => ({
  runExit: <A, E>(eff: Effect.Effect<A, E, GraphQLClient>) =>
    Effect.runPromiseExit(eff.pipe(Effect.provide(layer))),
}) satisfies Pick<UiRuntime, 'runExit'>;

describe('ProductsStore', () => {
  it('loads products into RemoteData.Success', async () => {
    const fake = Layer.succeed(
      GraphQLClient,
      GraphQLClient.of({
        request: () =>
          Effect.succeed({
            // must match ListProductsResponse schema shape
            listProducts: [{ id: 1, description: 'x', __typename: 'Product' }],
          } as any),
      }),
    );

    const rt = makeTestRuntime(fake);
    const store = new ProductsStore(rt as any);

    store.loadProducts();

    // wait one tick for promise continuation
    await Promise.resolve();

    const state = store.products();
    expect(state._tag).toBe('Success');
    if (state._tag === 'Success') {
      expect(state.value[0]?.id).toBe(1);
    }
  });
});
```

This is the payoff: you can test the store as a small algebra with a mocked `GraphQLClient`, exactly like you’d test an Effect program with a test `Layer`.

### Component tests

Only test components for:

* template wiring
* accessibility / rendering of given store states

Mock the store, do not mock the world.

---

## Where Apollo *might* be justified (and when it isn’t)

Apollo buys you:

* normalized cache
* sophisticated pagination policies
* reactive query updates

But its “reactivity” is a second signal network that will compete with Angular’s signals and your own stores. In categorical terms, you get *two competing comonads* of “state with context”, and coherence becomes work.

Given your preferences, start with **explicit stores + explicit signals**, and only adopt Apollo if you can state a crisp requirement like:

> “We need normalized caching with automatic referential updates across 10+ screens, and we can’t cheaply implement the required cache algebra ourselves.”

Otherwise it’s accidental complexity.

---

## Summary of the architecture in one sentence

A frontend is a functor
**(Effect programs + Layered services)** ⟶ **(Signals as time-indexed values)** ⟶ **(Pure components / views)**,
with exactly one natural transformation at the boundary: `runExit : Effect<A,E,R> → Promise<Exit<A,E>>`.

---

If you want the next increment, the most leverage-per-line step is: **extract your `src/domain/**` into a shared package** consumed by both backend and Angular, so the frontend literally imports the same schemas you already use for GraphQL + persistence. That makes “runtime truth” a single object in your whole system.

[1]: https://angular.dev/guide/zoneless "https://angular.dev/guide/zoneless"
[2]: https://effect-ts.github.io/effect/effect/ManagedRuntime.ts.html?utm_source=chatgpt.com "ManagedRuntime.ts - effect"
[3]: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-graphql-request "https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-graphql-request"
[4]: https://angular.dev/guide/testing/migrating-to-vitest "https://angular.dev/guide/testing/migrating-to-vitest"

----

Below is a concrete, **mechanical** sequence of edits that turns your current repo into a “2-object product”:

* **`lect-effect` backend** (unchanged logical behavior)
* **`@lect-effect/domain` shared package** (extracted from `src/domain`)
* **`apps/frontend` Angular frontend** (zoneless + signals + Effect runtime bridge)

I’m optimizing for a minimal working example (MWE) that:

1. builds and runs the backend,
2. builds and runs the Angular app,
3. imports the shared domain schemas/types from both sides,
4. performs one real GraphQL round-trip (`greet`) and validates the response via **Effect Schema**.

(Your current scripts / tooling assumptions: `pnpm@10.22.0`, Node 24, `tsc` build, `docgen` scripts, and a GraphQL Yoga server on `http://localhost:${port}/graphql` with default `port = 4000`.)

---

## Phase 1 — Turn the repo into a pnpm workspace

### 1. Add `pnpm-workspace.yaml` at repo root

Create a new file:

```yaml
# pnpm-workspace.yaml
packages:
  - "."
  - "packages/*"
  - "apps/*"
```

This makes your repo a “category with objects = packages” and pnpm workspace linking becomes the canonical “inclusion functor”.

---

## Phase 2 — Extract `src/domain` into `packages/domain`

### 2. Create the new package skeleton

Create:

```
packages/domain/
  package.json
  tsconfig.json
  src/
```

#### `packages/domain/package.json`

Use a CJS build first (minimizes friction with your current backend runtime). Also add an `exports` map that supports **deep imports** like `@lect-effect/domain/hello/helloResponse`.

> Key detail: Node’s `exports` subpath patterns do *not* do magic extension resolution; include `.js` in the target pattern. Node’s docs explicitly describe subpath pattern replacement and that it’s a direct textual match. ([Node.js][1])

```json
{
  "name": "@lect-effect/domain",
  "version": "0.0.0",
  "private": true,
  "type": "commonjs",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./*": "./dist/*.js"
  },
  "files": ["dist"],
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "effect": "^3.19.14"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

Notes:

* `./* -> ./dist/*.js` allows `@lect-effect/domain/hello/nameInput` etc, with `*` matching nested paths (per Node’s subpath pattern semantics). ([Node.js][1])
* We keep it CJS for now, so your backend (currently CJS at runtime) can import without `ERR_REQUIRE_ESM`.

#### `packages/domain/tsconfig.json`

```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "composite": false,
    "noEmit": false
  },
  "include": ["src"]
}
```

(Using your existing `@tsconfig/node24` baseline is consistent with the repo. )

#### `packages/domain/src/index.ts`

A tiny barrel is useful (not required for deep-imports, but helpful):

```ts
export * from "./errors.js";
```

(You can later expand this; MWE doesn’t need it.)

---

### 3. Move `src/domain/*` into `packages/domain/src/*`

From repo root:

```bash
mkdir -p packages/domain/src
git mv src/domain/* packages/domain/src/
rmdir src/domain
```

This preserves your internal domain module graph (relative imports inside the domain remain valid because we kept the same internal shape).

---

### 4. Wire the backend to depend on the shared domain package

#### 4.1 Add dependency at root

Edit root `package.json` and add:

```json
"dependencies": {
  "@lect-effect/domain": "workspace:*",
  ...
}
```

(Your root `package.json` is already pnpm-based and has Effect + GraphQL Yoga etc. )

#### 4.2 Ensure the domain is built *before* backend `tsc`

Right now your backend build is just `tsc`.
Change it to:

```json
"scripts": {
  "build": "pnpm -C packages/domain build && tsc",
  ...
}
```

Do the same for any script that runs TS that might import the domain at runtime (e.g. tests):

```json
"test": "pnpm -C packages/domain build && vitest run",
"test:unit": "pnpm -C packages/domain build && vitest run --coverage=false",
"test:integration": "pnpm -C packages/domain build && vitest run --coverage=false --config vitest.integration.config.ts"
```

(Use the scripts you actually have; the point is: **precompose** domain build before consumers.)

#### 4.3 Update docgen to include the new source root (optional but recommended)

Your docs generator currently targets only `./src/`.
If you want to keep docs complete:

```json
"docs:generate": "docgen --project tsconfig.json --src ./src/ --out ./docs/src/content/docs/src/ --exclude \"\\.test\" \"\\.spec\" \"\\.config\" \"__snapshots__\" && docgen --project packages/domain/tsconfig.json --src ./packages/domain/src/ --out ./docs/src/content/docs/src/ --exclude \"\\.test\" \"\\.spec\" \"\\.config\" \"__snapshots__\""
```

---

### 5. Rewrite imports in backend + tests

You currently import domain modules via relative paths like:

* `import { greetingSchema } from '../domain/hello/greeting'`
* `import { productSchema } from './././src/domain/product/product'`

After extraction, the *stable* import is:

```ts
import { greetingSchema } from "@lect-effect/domain/hello/greeting";
```

Do this mechanically:

#### 5.1 Replace all occurrences of `/src/domain/` imports

* Find: `from '.../src/domain/XYZ'`
* Replace with: `from '@lect-effect/domain/XYZ'`

#### 5.2 Replace all occurrences of `/domain/` imports inside backend code

* Find: `from '../domain/XYZ'`, `from '../../domain/XYZ'`, etc
* Replace with: `from '@lect-effect/domain/XYZ'`

This is a straightforward “reindexing” of morphisms in your import graph: the domain object is now addressed by its package name rather than by its old position in the filesystem product.

---

### 6. Install everything once (workspace install)

From repo root:

```bash
pnpm install
```

Then build:

```bash
pnpm -C packages/domain build
pnpm build
```

At this point your backend should compile again.

---

## Phase 3 — Add `apps/frontend` Angular app (zoneless + signals + Effect)

We will create the Angular app inside `apps/frontend` as in the architecture plan.

### 7. Scaffold Angular app into `apps/frontend`

Use Angular CLI’s `ng new` with **zoneless** enabled.

Angular CLI reference shows:

* standalone defaults to true,
* Vitest is the default test runner for new projects,
* and there is a `--zoneless` option in `ng new`. ([Angular][2])

From repo root:

```bash
pnpm dlx @angular/cli@latest new web \
  --directory apps/frontend \
  --package-manager pnpm \
  --routing \
  --style scss \
  --zoneless \
  --skip-git \
  --skip-install
```

Then install from the workspace root:

```bash
pnpm install
```

---

### 8. Add shared deps to the frontend package

From repo root:

```bash
pnpm -C apps/frontend add @lect-effect/domain@workspace:* effect
```

(Angular deps are already in `apps/frontend/package.json` from `ng new`.)

---

### 9. Add a dev-proxy so `/graphql` hits the backend

Your backend prints it serves GraphQL at `http://localhost:${port}/graphql`, and config defaults `port = 4000`.

Create `apps/frontend/proxy.conf.json`:

```json
{
  "/graphql": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Update `apps/frontend/package.json` start script to:

```json
"start": "ng serve --proxy-config proxy.conf.json"
```

Now the browser can `fetch('/graphql', ...)` without CORS concerns.

---

## Phase 4 — Put the MWE modules in place

We’ll instantiate the plan’s “core” modules: Effect runtime bridge + GraphQL client + a single feature (`hello`) with a store using Signals.

Also, since we are zoneless: Angular’s own guide explicitly recommends moving application components toward `OnPush` compatibility, and enabling zoneless by providing `provideZonelessChangeDetection()`. ([Angular][3])

### 10. Ensure zoneless provider exists in `app.config.ts`

Depending on what `ng new --zoneless` generated, ensure `apps/frontend/src/app/app.config.ts` includes:

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideZonelessChangeDetection()]
};
```

This matches Angular’s zoneless guide. ([Angular][3])

---

### 11. Core GraphQL client as an Effect service

Create `apps/frontend/src/app/core/graphql/graphql-client.ts`:

```ts
import { Context, Effect, Layer, Schema } from "effect";

export class GraphQLClientError extends Error {
  readonly _tag = "GraphQLClientError";
  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}

export type GraphQLRequest = Readonly<{
  query: string;
  variables?: unknown;
}>;

export type GraphQLResponse = Readonly<{
  data?: unknown;
  errors?: unknown;
}>;

export class GraphQLClient extends Context.Tag("GraphQLClient")<
  GraphQLClient,
  {
    readonly execute: (req: GraphQLRequest) => Effect.Effect<GraphQLResponse, GraphQLClientError>;
  }
>() {}

const GraphQLResponseSchema = Schema.Struct({
  data: Schema.optional(Schema.Unknown),
  errors: Schema.optional(Schema.Unknown)
});

export const GraphQLClientLive = Layer.succeed(
  GraphQLClient,
  GraphQLClient.of({
    execute: (req) =>
      Effect.tryPromise({
        try: async () => {
          const res = await fetch("/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(req)
          });

          // GraphQL Yoga should return JSON
          const json = await res.json();
          // validate envelope shape (not the inner data yet)
          return Schema.decodeUnknownSync(GraphQLResponseSchema)(json);
        },
        catch: (cause) => new GraphQLClientError("GraphQL request failed", cause)
      })
  })
);
```

This is the “ambient functor” from HTTP to your Effect world: `fetch` is the only impurity.

---

### 12. Core UI runtime bridge (ManagedRuntime)

Create `apps/frontend/src/app/core/effect/ui-runtime.service.ts`:

```ts
import { DestroyRef, Injectable } from "@angular/core";
import { Effect, Layer, ManagedRuntime } from "effect";
import { GraphQLClientLive } from "../graphql/graphql-client";

@Injectable({ providedIn: "root" })
export class UiRuntime {
  private readonly runtime = ManagedRuntime.make(GraphQLClientLive);

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      // Close fibers/resources if any are held by layers in the future.
      void this.runtime.dispose();
    });
  }

  runFork<A, E>(eff: Effect.Effect<A, E>): void {
    this.runtime.runFork(eff);
  }
}
```

This makes “where effects occur” explicit: **all fibers are launched through `UiRuntime`**.

---

### 13. A minimal `RemoteData` (optional but keeps state explicit)

Create `apps/frontend/src/app/core/state/remote-data.ts`:

```ts
export type RemoteData<E, A> =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Failure"; readonly error: E }
  | { readonly _tag: "Success"; readonly value: A };

export const RemoteData = {
  initial: <E, A>(): RemoteData<E, A> => ({ _tag: "Initial" }),
  loading: <E, A>(): RemoteData<E, A> => ({ _tag: "Loading" }),
  failure: <E, A>(error: E): RemoteData<E, A> => ({ _tag: "Failure", error }),
  success: <E, A>(value: A): RemoteData<E, A> => ({ _tag: "Success", value })
} as const;
```

---

### 14. Feature: Hello API (GraphQL + schema validation)

Create `apps/frontend/src/app/feature/hello/hello.api.ts`:

```ts
import { Effect, Schema } from "effect";
import { GraphQLClient } from "../../core/graphql/graphql-client";

import { helloResponseSchema, type HelloResponse } from "@lect-effect/domain/hello/helloResponse";
import { nameInputSchema, type NameInput } from "@lect-effect/domain/hello/nameInput";

const HelloQuery = `
  query Hello($name: String) {
    greet(name: $name) {
      greeting
    }
  }
`;

const HelloDataSchema = Schema.Struct({
  greet: helloResponseSchema
});

export class HelloApiError extends Error {
  readonly _tag = "HelloApiError";
  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}

export const greet = (input: NameInput): Effect.Effect<HelloResponse, HelloApiError, GraphQLClient> =>
  Effect.gen(function* () {
    // validate input with shared schema (frontend does not trust itself)
    const variables = yield* Schema.decodeUnknown(nameInputSchema)(input).pipe(
      Effect.mapError((e) => new HelloApiError("Invalid input", e))
    );

    const client = yield* GraphQLClient;
    const resp = yield* client.execute({ query: HelloQuery, variables }).pipe(
      Effect.mapError((e) => new HelloApiError("Network/transport error", e))
    );

    if (resp.errors != null) {
      return yield* Effect.fail(new HelloApiError("GraphQL responded with errors", resp.errors));
    }

    const data = yield* Schema.decodeUnknown(HelloDataSchema)(resp.data).pipe(
      Effect.mapError((e) => new HelloApiError("Invalid GraphQL data shape", e))
    );

    return data.greet;
  });
```

This is the critical invariant: **GraphQL is untyped JSON; schemas reintroduce a law.**

---

### 15. Feature: Hello store (Signals + explicit Effect launch)

Create `apps/frontend/src/app/feature/hello/hello.store.ts`:

```ts
import { Injectable, computed, signal } from "@angular/core";
import { Effect } from "effect";

import { UiRuntime } from "../../core/effect/ui-runtime.service";
import { RemoteData, type RemoteData as RD } from "../../core/state/remote-data";
import { greet } from "./hello.api";
import type { HelloResponse } from "@lect-effect/domain/hello/helloResponse";

@Injectable({ providedIn: "root" })
export class HelloStore {
  private readonly state_ = signal<RD<unknown, HelloResponse>>(RemoteData.initial());

  readonly state = this.state_.asReadonly();
  readonly greeting = computed(() => {
    const s = this.state_();
    return s._tag === "Success" ? s.value.greeting : null;
  });

  constructor(private readonly runtime: UiRuntime) {}

  run(name: string | null): void {
    this.state_.set(RemoteData.loading());

    const eff = greet({ name }).pipe(
      Effect.tap((value) => Effect.sync(() => this.state_.set(RemoteData.success(value)))),
      Effect.catchAll((error) => Effect.sync(() => this.state_.set(RemoteData.failure(error))))
    );

    this.runtime.runFork(eff);
  }
}
```

---

### 16. Hello page component (OnPush + signals)

Create `apps/frontend/src/app/feature/hello/hello.page.ts`:

```ts
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { HelloStore } from "./hello.store";

@Component({
  standalone: true,
  selector: "app-hello-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Hello</h1>

    <label>
      Name:
      <input [value]="name()" (input)="name.set(($any($event.target).value ?? null) || null)" />
    </label>

    <button (click)="store.run(name())">Greet</button>

    @if (store.state()._tag === "Loading") {
      <p>Loading…</p>
    }

    @if (store.state()._tag === "Failure") {
      <pre>{{ store.state() | json }}</pre>
    }

    @if (store.state()._tag === "Success") {
      <p>Greeting: {{ store.greeting() }}</p>
    }
  `
})
export class HelloPage {
  readonly name = signal<string | null>(null);
  constructor(readonly store: HelloStore) {}
}
```

OnPush is recommended by Angular’s zoneless guide as a step toward compatibility. ([Angular][3])

---

### 17. Wire routing

Edit `apps/frontend/src/app/app.routes.ts`:

```ts
import { Routes } from "@angular/router";
import { HelloPage } from "./feature/hello/hello.page";

export const routes: Routes = [
  { path: "", pathMatch: "full", component: HelloPage }
];
```

Now MWE UI is one route, one store.

---

## Phase 5 — Run the MWE

### 18. Terminal A: start backend dependencies (db) + server

Follow your existing backend run procedure (docker compose + migrations etc). Your quickstart uses `./run.sh` for infra and `pnpm start` to run the server.

Example:

```bash
./run.sh
pnpm build
pnpm start
```

Confirm you see something like: `GraphQL Server running on http://localhost:4000/graphql`

### 19. Terminal B: start the Angular dev server

```bash
pnpm -C apps/frontend start
```

Open `http://localhost:4200/`, type a name, click **Greet**.
You should see the greeting rendered, with the response validated by `helloResponseSchema` from the shared package.

---

## What you have after this MWE (why it won’t become a rat’s nest)

* The **shared domain** is a standalone object `@lect-effect/domain` with an explicit boundary.
* The frontend graph of dependencies is shaped like:

  `Component → Store (Signals) → UiRuntime (Effect launcher) → GraphQLClient (Effect service) → fetch`

  i.e. a very small span category with one impurity at the edge.
* Zoneless is enabled explicitly via `provideZonelessChangeDetection()` as in Angular’s own guidance. ([Angular][3])
* You can now grow features as independent “summands” under `src/app/feature/*` (as in the architecture plan).

---

## If you hit exactly one common snag: Angular warns about CommonJS

Because `@lect-effect/domain` is initially built as CommonJS, Angular may warn about it (tree-shaking). If it does, the pragmatic MWE fix is:

* in `apps/frontend/angular.json`, under build options, add it to `allowedCommonJsDependencies`.

Long-term, you can upgrade `@lect-effect/domain` to dual ESM/CJS exports, but that is strictly a later refinement.

---

If you want, next step is to **mechanize GraphQL type derivation** (codegen) *without* adopting Apollo’s observable-centric client: i.e. generate only the typed documents + operation result types, then keep your “Effect + Schema decode” boundary exactly where it is.

[1]: https://nodejs.org/api/packages.html "https://nodejs.org/api/packages.html"
[2]: https://angular.dev/cli/new "https://angular.dev/cli/new"
[3]: https://angular.dev/guide/zoneless "Zoneless • Angular"


-----

Mechanizing GraphQL type derivation is **simple** (in the sense of “a small, standard toolchain step”), *provided* you are willing to treat GraphQL codegen as a **compile-time functor** from your schema to TypeScript witnesses. The only “complex” variant is making it fully hermetic (no running server needed) by emitting a schema artifact from the backend first; that’s optional for an MWE.

Below is a concrete, minimal path that piggybacks on an existing library: **GraphQL Code Generator** (The Guild).

---

## What we are mechanizing (and what we are not)

Your backend already enforces the invariant “domain is canonical; GraphQL is a thin presentation”. We keep the *same invariant* in the frontend:

* **Effect Schemas** remain the **runtime truth object**: decoding/validation/arbitraries come from them.
* **GraphQL codegen** supplies **compile-time proofs** that your selection sets and variable shapes match the current GraphQL schema (a left-adjoint-ish convenience; it does not define runtime semantics).

So: “typed twice” = compile-time via codegen + runtime via schema decoding.

---

## Step-by-step: GraphQL type derivation for an MWE

I’ll assume the repo already contains (or will contain, per your plan) `apps/frontend/` as the Angular app and the backend is reachable at `/graphql` when running `pnpm start` (your docs explicitly say it logs a GraphQL URL on startup).

### 0) Pick the simplest schema source (MWE choice)

**MWE choice:** introspect the **running** backend.

* Pros: zero additional backend work.
* Cons: codegen requires the server running.

Your backend already starts a Yoga GraphQL server at `http://localhost:<port>/graphql`  (default port comes from config; the docs show `BACKEND_PORT` default 4000).

So for MWE we target:

* `http://localhost:4000/graphql` (or whatever `BACKEND_PORT` is)

---

### 1) Install codegen tooling **in the frontend workspace**

In `apps/frontend`:

```bash
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset graphql
```

Why these:

* `@graphql-codegen/client-preset` generates *operation result/variable types* and typed documents suitable for app clients. ([The Guild][1])
* We will configure **DocumentMode = string** to avoid shipping GraphQL AST machinery to the browser; generated documents become `TypedDocumentString` and you call `.toString()` to get the query string at runtime. ([The Guild][1])
* `graphql` is required by codegen tooling (parsing/introspection) and commonly expected as a peer dependency.

---

### 2) Add a `codegen.ts` in `apps/frontend/`

Create `apps/frontend/codegen.ts`:

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // MWE: read schema via introspection from the running backend
  schema: 'http://localhost:4000/graphql',

  // We keep GraphQL documents co-located with the API boundary in TS files
  documents: ['src/app/**/*.ts', '!src/app/gql/**'],

  ignoreNoDocuments: false,

  generates: {
    'src/app/gql/': {
      preset: 'client',
      presetConfig: {
        // Keep the mental model small. Fragment masking is great, but it’s extra apparatus.
        fragmentMasking: false, // supported by client-preset :contentReference[oaicite:9]{index=9}
      },
      config: {
        // Key choice: ship *strings*, not AST nodes
        documentMode: 'string', // produces TypedDocumentString with toString() :contentReference[oaicite:10]{index=10}

        // Quality-of-life / noise reduction
        useTypeImports: true,
        skipTypename: true,
        immutableTypes: true,
      },
    },
  },
};

export default config;
```

Notes:

* `documentMode: 'string'` is the “minimal runtime dependency” switch. ([The Guild][1])
* Disabling fragment masking is explicitly supported and keeps testing + ergonomics simpler. ([The Guild][1])

---

### 3) Add scripts in `apps/frontend/package.json`

In `apps/frontend/package.json`:

```json
{
  "scripts": {
    "graphql:codegen": "graphql-codegen --config codegen.ts",
    "graphql:codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "prebuild": "pnpm graphql:codegen",
    "build": "ng build"
  }
}
```

This ensures “generated witnesses exist” before Angular compiles.

---

### 4) Update your frontend GraphQL client to accept codegen documents

In your plan you already have a minimal `GraphQLClient` that takes a `query: string` and optional variables, returning `Json`. For codegen with string-document mode, you want the client to accept **anything with `toString(): string`**.

Modify the signature like this (structural typing; no dependency on codegen types):

```ts
// core/graphql/graphql-client.ts

export interface GraphQLDocumentLike {
  readonly toString: () => string;
}

// ... existing Json + errors ...

export class GraphQLClient extends Context.Tag('ui/GraphQLClient')<
  GraphQLClient,
  {
    readonly request: (
      query: string | GraphQLDocumentLike,
      variables?: Record<string, Json>,
    ) => Effect.Effect<Json, FrontendApiError>;
  }
>() {}
```

and in the live implementation:

```ts
request: (query, variables) => {
  const queryString = typeof query === 'string' ? query : query.toString();
  // then POST { query: queryString, variables }
}
```

This aligns perfectly with `TypedDocumentString` (codegen) because it provides `.toString()` by design. ([The Guild][1])

This keeps GraphQL “RPC-over-HTTP” small and explicit (matching your plan).

---

### 5) Use codegen in the API boundary (and still decode via Effect Schema)

Now you colocate:

* the **GraphQL selection** (compile-time witness via codegen)
* the **decoder** (runtime witness via Effect Schema)

inside `src/app/api/**`.

Example: `apps/frontend/src/app/api/product.api.ts`

```ts
import { Effect, Schema } from 'effect';
import { GraphQLClient } from '../core/graphql/graphql-client';
import { graphql } from '../gql';

// From the shared domain package (after you extract it), *not* redefined in the frontend:
import { productSchema } from '@lect/domain/product/product';

const ListProductsResponse = Schema.Struct({
  listProducts: Schema.Array(productSchema),
});

const ListProductsDoc = graphql(/* GraphQL */ `
  query ListProducts {
    listProducts { id description }
  }
`);

export const listProducts = Effect.gen(function* () {
  const gql = yield* GraphQLClient;

  // compile-time: ListProductsDoc carries variable/result types
  // runtime: gql.request returns Json which we decode
  const data = yield* gql.request(ListProductsDoc);

  const decoded = yield* Schema.decodeUnknown(ListProductsResponse)(data);
  return decoded.listProducts;
});
```

This is exactly the “API typed twice” invariant you want, and it preserves your backend rule “do not let GraphQL own business semantics”.

---

### 6) Run it (MWE workflow)

1. Start the backend (so schema introspection works):

   ```bash
   pnpm migrate:masterdata
   pnpm start
   ```

   (Those are your documented standard arrows).

2. In `apps/frontend`:

   ```bash
   pnpm graphql:codegen
   pnpm start
   ```

At this point you have generated:

* `apps/frontend/src/app/gql/*` containing typed documents and TS types.

---

## Is this “simple” or “complex”?

### Simple (MWE)

* Introspect schema from `http://localhost:4000/graphql`.
* Generate typed documents as **strings**.
* Keep runtime semantics in Effect Schema decoders.

This is genuinely a small step: one config file, three dev deps, and a tiny tweak to your GraphQL client.

### More complex (but more “categorically closed”)

If you want codegen to be independent of a running server, you introduce a backend build step that **prints the schema** to `schema.graphql` and make codegen read that file. This is extra plumbing, not conceptual complexity.

---

## What else can we derive from Effect Schemas (beyond “validate HelloResponse”)?

Effect Schemas already give you (conceptually) a **classifier** of well-formed values; in UI terms, they define the subobject of valid inputs. Your plan already uses them for:

* decoding GraphQL responses into domain values (runtime contract)
* validating inputs before sending mutations
* property-based generation via `Arbitrary.make(schema)` (already used in backend)

Beyond that, high-leverage derivations in the frontend are:

1. **View schemas as projections**
   A screen rarely needs the full `Product`; it needs a *projection* (a “display object”).
   So define *view types* as **pullbacks/projections** of the canonical schema:

   * `ProductListItemSchema = Schema.pick(productSchema, 'id', 'description')`
   * `ProductCardSchema = Schema.Struct({ id: productIdSchema, title: ..., subtitle: ... })` built from the same atoms.

2. **Form decoding + error reporting**
   Forms become:

   * raw signal: `Signal<unknown>`
   * decoded signal: `Signal<Either<ParseError, A>>`
     This makes validation errors explicit data, not side effects.

3. **Stable codecs for persistence**
   `localStorage`/URL params/session payloads: treat them as another boundary; decode/encode using the same schemas.

4. **Test data + component fixtures**
   Generated arbitraries become your fixture factory for UI tests (store tests, component tests).

So Effect Schemas remain the “one object” you reindex everything against—exactly your backend’s organizing principle.

---

## Will the frontend have its own `Product`, `ProductId`, etc.?

**No**—not if you preserve the factorization you already insist on.

You want:

* **One canonical domain package** containing `ProductId`, `Product`, `ProductWithItems`, etc., as schemas+types.
* The backend and frontend both import that package.

GraphQL codegen will also generate a `Product` type (from the GraphQL schema), but in this architecture that type is **boundary-local**: it lives in `apps/frontend/src/app/gql/**` and should not leak past the `api/**` layer. That matches your backend doctrine that GraphQL is a representation, not the meaning.

When a GraphQL query returns only a subset of fields, you have two principled options:

1. **Return a domain projection** (recommended):
   Decode into `Pick<Product, ...>` derived from the domain schema.

2. **Return full domain objects** only when the selection set is sufficient:
   i.e. the query is literally a view that contains all fields required by the domain schema.

Either way, the frontend does **not** define a second `Product` ontology.

---

## The “component mixes model + presentation + state” worry

You’re right that a component is where these three meet. The way to keep it non-chaotic is to **force a factorization**:

### 1) Domain / ViewModel (pure)

* domain schemas/types (shared package)
* view-model mappers: `Product -> ProductCardVM` (pure functions)

### 2) Store (the only Kleisli boundary in the UI)

* holds `Signal<RemoteData<E, A>>` etc.
* runs effects and writes to signals

### 3) Component (pure renderer)

* reads signals
* emits events
* does not know about fetch/GraphQL/Effect runtime

This is the exact “pure subcategory + one Kleisli boundary” invariant already stated in the plan.

Concretely: a *presentational* component should depend on **a small VM type**, not on the full `Product`, and certainly not on the GraphQL-generated type. The store owns the choice of projection and the mapping. That keeps the dependency graph thin and makes testing trivial: mock the store (or even just provide a signal) and assert rendering.

---

## Why this organization is the “best” fit for your preferences

Because it gives you a **single coherent factorization** analogous to your backend:

* Backend: `Domain → Handlers/Services (Effect) → GraphQL`
* Frontend: `Domain → API (GraphQL + decode) → Stores (Effect boundary) → Components (pure)`

This has three payoffs:

1. **Local reasoning**: each layer has a small interface and a single kind of morphism.
2. **Testability by construction**: stores are small algebras you can run against mocked layers (exactly like backend handler tests).
3. **No “rat’s nest” propagation**: signals only flow from stores to components; effects only run in stores; GraphQL only occurs in `api/**`.

If you want, the next incremental refinement (after codegen) is to introduce explicit **VM modules** per feature so “a component never imports `Product` at all”—it imports `ProductCardVM` and stays maximally parametric.

---

If you paste (or point me to) one real operation you care about next (e.g. `createProductWithItems`), I’ll show the **fully typed** version end-to-end: codegen doc + input schema validation + response decoding + store command + a pure page component, with the smallest possible surface area.

[1]: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client "Cloud Security Alliance Star Level One Badge"


----

Below is a **minimal, end‑to‑end slice** that composes:

1. **Shared domain** (Effect `Schema` + types, extracted from your backend `src/domain`)
2. **GraphQL type derivation** via **GraphQL Code Generator** (compile‑time functor from GraphQL schema → TS types)
3. A tiny **GraphQLClient** (fetch + typed errors) as an Effect service
4. A **ProductApi** “algebra” (Effects that validate input/output via Schemas)
5. A **CreateProductStore** (signals = state; Effects only executed here)
6. Two components:

   * **CreateProductFormComponent** (local form state + schema validation, no Effects)
   * **CreateProductResultComponent** (pure rendering)
7. **main.ts** bootstrap (standalone + **zoneless** change detection)

This matches your backend facts:

* Server logs it serves GraphQL at `http://localhost:<port>/graphql`, with `BACKEND_PORT` default `4000`.
* The mutation and its variable types/selection set are exactly the ones used in tests.
* The shared domain schemas for `CreateItemInput`, `CreateProductWithItemsInput`, `ProductInput`, `ProductWithItems`, etc. are as in your domain files.

---

## Why this organization is “non‑rat’s‑nest” in categorical terms

Think of the frontend as a small diagram of categories and functors:

* **Domain**: objects are domain types (`Product`, `CreateItemInput`, …), with **Schema** as a classifier of “valid inhabitants”.
* **Generated GraphQL types**: a *separate* type theory induced by the GraphQL schema, obtained by a **left adjoint-ish** compilation step (codegen).
* **Api layer**: a functor
  [
  \textsf{GraphQLDocuments} \to \textsf{Effect}
  ]
  that *re-validates* input/output via Schemas (so runtime truth is governed by your domain).
* **Store**: a coalgebra for UI state transitions; it is the only place you apply the “natural transformation”
  [
  \textsf{Effect} \Rightarrow \textsf{Promise}
  ]
  (i.e. where Effects are actually run).
* **Components**: morphisms from **Signals** to DOM; ideally “sheaves over UI context”: they are local, compositional, and easy to test because their dependencies are explicit via inputs/outputs.

Net effect: **domain structure is not defined inside components**. Components *consume* domain values; the store *produces* them; the API *validates* them.

---

## 0) Prereqs: zoneless + codegen are real, supported paths

* Angular supports **zoneless** via `provideZonelessChangeDetection()` and recommends `OnPush` as the default change detection strategy.
* Angular’s `input()` (signal inputs) is production-ready.
* Angular’s `output()` is available for typed outputs.
* GraphQL Code Generator supports `preset: "client"` and `documentMode: "string"` so documents become **typed strings** (no AST/printing required).

---

## 1) Shared domain package (copied verbatim from backend domain)

Assume you extracted backend `src/domain/**` into a workspace package:

```
packages/domain/src/...
```

Minimal exports needed for this example:

### `packages/domain/src/index.ts`

```ts
export * from "./item/createItemInput";
export * from "./item/item";

export * from "./product/productInput";
export * from "./product/product";
export * from "./product/productWithItems";
export * from "./product/createProductWithItemsInput";
```

The relevant schemas/types correspond to your current definitions:

* `CreateItemInput` + `createItemInputSchema`
* `Item` + `itemSchema`
* `ProductInput` + `productInputSchema` and `ProductWithItems` + `productWithItemsSchema`
* `CreateProductWithItemsInput` + `createProductWithItemsInputSchema`

---

## 2) GraphQL codegen (mechanized type derivation)

### Install dev deps in the Angular app

In `apps/frontend/`:

```bash
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset graphql
```

### `apps/frontend/src/app/graphql/createProductWithItems.graphql`

Use the *exact* mutation shape from your backend tests:

```graphql
mutation CreateProductWithItems(
  $product: CreateProductWithItemsProductInput!
  $items: [CreateItemInput!]!
) {
  createProductWithItems(product: $product, items: $items) {
    product { id description __typename }
    items { id description pack_size }
  }
}
```

### `apps/frontend/codegen.ts`

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["src/app/**/*.graphql"],
  generates: {
    "src/app/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        // Generate TypedDocumentString (string-based) docs, ideal for fetch.
        documentMode: "string",
      },
    },
  },
};

export default config;
```

This `documentMode: "string"` pattern is explicitly supported by the client preset.

### `apps/frontend/package.json` (scripts)

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts"
  }
}
```

Run:

```bash
pnpm -C apps/frontend codegen
```

### Representative generated output (excerpt)

After codegen, you’ll get files under `apps/frontend/src/app/gql/`. One of them will export:

```ts
// apps/frontend/src/app/gql/graphql.ts  (GENERATED)
export type CreateProductWithItemsMutationVariables = Exact<{
  product: CreateProductWithItemsProductInput;
  items: Array<CreateItemInput>;
}>;

export type CreateProductWithItemsMutation = {
  createProductWithItems: {
    product: { id: number; description?: string | null; __typename?: "Product" };
    items: Array<{ id: number; description?: string | null; pack_size: number }>;
  };
};

export const CreateProductWithItemsDocument =
  new TypedDocumentString(/* GraphQL */ `
    mutation CreateProductWithItems($product: CreateProductWithItemsProductInput!, $items: [CreateItemInput!]!) {
      createProductWithItems(product: $product, items: $items) {
        product { id description __typename }
        items { id description pack_size }
      }
    }
  `) as unknown as TypedDocumentString<
    CreateProductWithItemsMutation,
    CreateProductWithItemsMutationVariables
  >;
```

(Exact formatting varies by codegen version; the key invariant is: **typed variables + typed document string**.)

---

## 3) Core: RemoteData + GraphQL client as Effect services

### `apps/frontend/src/app/core/effect/remote-data.ts`

```ts
export type RemoteData<E, A> =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Failure"; readonly error: E }
  | { readonly _tag: "Success"; readonly value: A };

export const RemoteData = {
  initial: <E, A>(): RemoteData<E, A> => ({ _tag: "Initial" }),
  loading: <E, A>(): RemoteData<E, A> => ({ _tag: "Loading" }),
  failure: <E, A>(error: E): RemoteData<E, A> => ({ _tag: "Failure", error }),
  success: <E, A>(value: A): RemoteData<E, A> => ({ _tag: "Success", value }),
} as const;
```

### `apps/frontend/src/app/core/graphql/graphql-errors.ts`

```ts
import { Data } from "effect";

export class FrontendGraphQLTransportError extends Data.TaggedError(
  "FrontendGraphQLTransportError",
)<{ readonly message: string; readonly status?: number; readonly cause?: unknown }> {}

export class FrontendGraphQLError extends Data.TaggedError(
  "FrontendGraphQLError",
)<{ readonly errors: ReadonlyArray<unknown> }> {}
```

### `apps/frontend/src/app/core/graphql/graphql-client.ts`

```ts
import { Context, Effect, Layer } from "effect";
import { FrontendGraphQLError, FrontendGraphQLTransportError } from "./graphql-errors";

export type Json =
  | null
  | boolean
  | number
  | string
  | readonly Json[]
  | { readonly [k: string]: Json };

// Structural “document string” interface.
// GraphQL Codegen’s TypedDocumentString satisfies this (it has .toString()).
export type DocumentString = { readonly toString: () => string };

export interface GraphQLClient {
  readonly request: (
    query: string | DocumentString,
    variables?: Record<string, unknown>,
  ) => Effect.Effect<Json, FrontendGraphQLTransportError | FrontendGraphQLError>;
}

export const GraphQLClient = Context.GenericTag<GraphQLClient>("GraphQLClient");

export const GraphQLClientLive = (endpoint: string) =>
  Layer.succeed(GraphQLClient, {
    request: (query, variables) =>
      Effect.tryPromise({
        try: async () => {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query: typeof query === "string" ? query : query.toString(),
              variables,
            }),
          });

          const json = (await res.json()) as { data?: Json; errors?: unknown[] };

          if (!res.ok) {
            throw new FrontendGraphQLTransportError({
              message: `HTTP ${res.status}`,
              status: res.status,
              cause: json,
            });
          }
          if (json.errors?.length) {
            throw new FrontendGraphQLError({ errors: json.errors });
          }
          return json.data ?? null;
        },
        catch: (cause) =>
          cause instanceof FrontendGraphQLTransportError || cause instanceof FrontendGraphQLError
            ? cause
            : new FrontendGraphQLTransportError({ message: "Network/parse error", cause }),
      }),
  });
```

---

## 4) Core: UI runtime (single place that “runs” Effects)

### `apps/frontend/src/app/core/effect/ui-runtime.ts`

```ts
import { Injectable } from "@angular/core";
import { Effect, Layer, ManagedRuntime } from "effect";
import { Either } from "effect";
import { GraphQLClientLive } from "../graphql/graphql-client";

// Root runtime environment (you can extend later with Auth, Logger, etc.)
const AppLayer = GraphQLClientLive("/graphql");

@Injectable({ providedIn: "root" })
export class UiRuntime {
  private readonly rt = ManagedRuntime.make(AppLayer);

  runEither<A, E>(eff: Effect.Effect<A, E>): Promise<Either.Either<E, A>> {
    return this.rt.runPromise(Effect.either(eff));
  }
}
```

Notes:

* I used `"/graphql"` as the endpoint so you can use an Angular dev-server proxy.
* Your backend indeed serves `/graphql`.

---

## 5) ProductApi: validate input, call GraphQL, validate output

### `apps/frontend/src/app/api/product.api.ts`

```ts
import { Effect, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";

import {
  createProductWithItemsInputSchema,
  productWithItemsSchema,
  type ProductWithItems,
} from "@lect-effect/domain";

import { GraphQLClient } from "../core/graphql/graphql-client";
import type {
  CreateProductWithItemsMutationVariables,
} from "../gql/graphql";
import { CreateProductWithItemsDocument } from "../gql/graphql";

import {
  FrontendGraphQLError,
  FrontendGraphQLTransportError,
} from "../core/graphql/graphql-errors";

const CreateProductWithItemsResponseSchema = Schema.Struct({
  createProductWithItems: productWithItemsSchema,
});
type CreateProductWithItemsResponse = Schema.Schema.Type<
  typeof CreateProductWithItemsResponseSchema
>;

export type CreateProductWithItemsError =
  | ParseError
  | FrontendGraphQLTransportError
  | FrontendGraphQLError;

export const createProductWithItems = (input: unknown) =>
  Effect.gen(function* () {
    // 1) Validate *input* with your shared domain schema
    const validated = yield* Schema.decodeUnknown(createProductWithItemsInputSchema)(input);

    // 2) GraphQL call (typed variables derived by codegen)
    const gql = yield* GraphQLClient;
    const variables: CreateProductWithItemsMutationVariables = {
      product: validated.product,
      items: validated.items,
    };

    const data = yield* gql.request(CreateProductWithItemsDocument, variables);

    // 3) Validate *output* with your shared domain schema
    const decoded: CreateProductWithItemsResponse =
      yield* Schema.decodeUnknown(CreateProductWithItemsResponseSchema)(data);

    return decoded.createProductWithItems satisfies ProductWithItems;
  });
```

This is the crux: **compile‑time** types from GraphQL codegen + **runtime** truth via Effect Schema.

---

## 6) Store: a small state machine over a Signal

### `apps/frontend/src/app/features/products/create-product.store.ts`

```ts
import { Injectable, signal } from "@angular/core";
import { Either } from "effect";
import type { ParseError } from "effect/ParseResult";

import { RemoteData } from "../../core/effect/remote-data";
import { UiRuntime } from "../../core/effect/ui-runtime";
import * as ProductApi from "../../api/product.api";
import type { ProductWithItems } from "@lect-effect/domain";
import type {
  FrontendGraphQLError,
  FrontendGraphQLTransportError,
} from "../../core/graphql/graphql-errors";

export type CreateProductUiError =
  | ParseError
  | FrontendGraphQLTransportError
  | FrontendGraphQLError;

@Injectable()
export class CreateProductStore {
  constructor(private readonly rt: UiRuntime) {}

  readonly created = signal(RemoteData.initial<CreateProductUiError, ProductWithItems>());

  create(input: unknown): void {
    this.created.set(RemoteData.loading());

    void this.rt.runEither(ProductApi.createProductWithItems(input)).then(
      Either.match({
        onLeft: (error) => this.created.set(RemoteData.failure(error)),
        onRight: (value) => this.created.set(RemoteData.success(value)),
      }),
    );
  }

  reset(): void {
    this.created.set(RemoteData.initial());
  }
}
```

---

## 7) Two components + one page

### 7.1 Form component (local draft state + schema validation)

### `apps/frontend/src/app/features/products/create-product-form.component.ts`

```ts
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { Effect, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { Either } from "effect";

import {
  createProductWithItemsInputSchema,
  type CreateProductWithItemsInput,
  type CreateItemInput,
} from "@lect-effect/domain";

@Component({
  selector: "app-create-product-form",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2>Create product</h2>

      <label>
        Product description (optional):
        <input
          [value]="productDescription() ?? ''"
          (input)="setProductDescription($any($event.target).value)"
        />
      </label>

      <h3>Add item</h3>

      <label>
        Item description (optional):
        <input
          [value]="itemDraft().description ?? ''"
          (input)="setItemDescription($any($event.target).value)"
        />
      </label>

      <label>
        Pack size (int):
        <input
          type="number"
          [value]="itemDraft().pack_size"
          (input)="setPackSize($any($event.target).valueAsNumber)"
        />
      </label>

      <button type="button" (click)="addItem()">Add item</button>

      <h4>Items</h4>
      <ul>
        @for (it of draft().items; track $index) {
          <li>
            desc={{ it.description ?? "∅" }}, pack_size={{ it.pack_size }}
            <button type="button" (click)="removeItem($index)">remove</button>
          </li>
        }
      </ul>

      <hr />

      @if (validation()._tag === "Left") {
        <p style="color: #b00">
          Invalid input (Schema rejected).
        </p>
      } @else {
        <p style="color: #070">
          Input is valid.
        </p>
      }

      <button type="button" [disabled]="disabled()" (click)="submit()">
        Submit
      </button>
    </section>
  `,
})
export class CreateProductFormComponent {
  // Parent controls disabled state (e.g. while Loading)
  readonly disabled = input<boolean>(false);

  // The only thing we emit is a *validated* domain value
  readonly submitted = output<CreateProductWithItemsInput>();

  // Local draft state (kept intentionally small)
  readonly productDescription = signal<string | null>(null);

  readonly itemDraft = signal<CreateItemInput>({
    description: null,
    pack_size: 1,
  });

  readonly draft = signal<CreateProductWithItemsInput>({
    product: { description: null },
    items: [],
  });

  // A pure witness: draft ↦ Either(ParseError, CreateProductWithItemsInput)
  readonly validation = computed((): Either.Either<ParseError, CreateProductWithItemsInput> =>
    Effect.runSync(
      Schema.decodeUnknown(createProductWithItemsInputSchema)(this.draft()).pipe(Effect.either),
    ),
  );

  setProductDescription(s: string): void {
    const v = s.trim();
    this.productDescription.set(v === "" ? null : v);
    this.draft.update((d) => ({ ...d, product: { description: v === "" ? null : v } }));
  }

  setItemDescription(s: string): void {
    const v = s.trim();
    this.itemDraft.update((it) => ({ ...it, description: v === "" ? null : v }));
  }

  setPackSize(n: number): void {
    this.itemDraft.update((it) => ({ ...it, pack_size: n }));
  }

  addItem(): void {
    const next = this.itemDraft();

    // Optional: validate per-item before inserting
    // (We rely mainly on full-struct validation via `validation`.)
    this.draft.update((d) => ({ ...d, items: [...d.items, next] }));

    // reset draft item
    this.itemDraft.set({ description: null, pack_size: 1 });
  }

  removeItem(ix: number): void {
    this.draft.update((d) => ({ ...d, items: d.items.filter((_, j) => j !== ix) }));
  }

  submit(): void {
    const v = this.validation();
    if (v._tag === "Right") this.submitted.emit(v.right);
  }
}
```

This component is “almost pure”: it manages local state, but does not know GraphQL, services, or Effects.

### 7.2 Result component (pure render)

### `apps/frontend/src/app/features/products/create-product-result.component.ts`

```ts
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { ProductWithItems } from "@lect-effect/domain";
import type { CreateProductUiError } from "./create-product.store";
import type { RemoteData } from "../../core/effect/remote-data";

@Component({
  selector: "app-create-product-result",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2>Result</h2>

      @switch (state()._tag) {
        @case ("Initial") {
          <p>No request yet.</p>
        }
        @case ("Loading") {
          <p>Creating…</p>
        }
        @case ("Failure") {
          <pre style="color: #b00">{{ formatError(state().error) }}</pre>
        }
        @case ("Success") {
          <h3>Product</h3>
          <p>id={{ state().value.product.id }}</p>
          <p>description={{ state().value.product.description ?? "∅" }}</p>

          <h3>Items</h3>
          <ul>
            @for (it of state().value.items; track it.id) {
              <li>
                id={{ it.id }},
                desc={{ it.description ?? "∅" }},
                pack_size={{ it.pack_size }}
              </li>
            }
          </ul>
        }
      }
    </section>
  `,
})
export class CreateProductResultComponent {
  readonly state = input.required<RemoteData<CreateProductUiError, ProductWithItems>>();

  formatError(e: unknown): string {
    // Keep minimal; later you can pattern-match tagged errors precisely.
    try {
      return JSON.stringify(e, null, 2);
    } catch {
      return String(e);
    }
  }
}
```

### 7.3 Page component tying them together

### `apps/frontend/src/app/features/products/create-product.page.ts`

```ts
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CreateProductStore } from "./create-product.store";
import { CreateProductFormComponent } from "./create-product-form.component";
import { CreateProductResultComponent } from "./create-product-result.component";

@Component({
  selector: "app-create-product-page",
  standalone: true,
  imports: [CreateProductFormComponent, CreateProductResultComponent],
  providers: [CreateProductStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-create-product-form
      [disabled]="store.created()._tag === 'Loading'"
      (submitted)="store.create($event)"
    />
    <app-create-product-result [state]="store.created()" />

    <button type="button" (click)="store.reset()">Reset</button>
  `,
})
export class CreateProductPageComponent {
  constructor(public readonly store: CreateProductStore) {}
}
```

Dependency graph is now linear and readable:
[
\textsf{Component} \to \textsf{Store} \to \textsf{Api} \to \textsf{GraphQLClient} \to \textsf{fetch}.
]

---

## 8) Bootstrap: standalone + zoneless

### `apps/frontend/src/app/app.component.ts`

```ts
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CreateProductPageComponent } from "./features/products/create-product.page";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CreateProductPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-create-product-page />`,
})
export class AppComponent {}
```

### `apps/frontend/src/app/app.config.ts`

```ts
import { ApplicationConfig } from "@angular/core";
import { provideZonelessChangeDetection } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
  ],
};
```

Angular supports the zoneless provider and recommends `OnPush` as the default.

### `apps/frontend/src/main.ts`

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

---

## 9) Dev server proxy (so UiRuntime can call `/graphql`)

### `apps/frontend/proxy.conf.json`

```json
{
  "/graphql": {
    "target": "http://localhost:4000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Then `ng serve --proxy-config proxy.conf.json`.

Your backend runs GraphQL at `/graphql` and defaults to port 4000.

---

## What you are (and are not) duplicating

* **Not duplicated**: `Product`, `Item`, `CreateProductWithItemsInput`, etc.
  Those are *shared* from `@lect-effect/domain` (same Schemas, same types).
* **Also not duplicated**: GraphQL variable and response *TypeScript types* for each operation: codegen derives them.
* **Still explicit** (by design): the mapping between “operation result” and “domain value”.
  That mapping is precisely the **Schema decode** step. It’s the canonical bridge from “external JSON-ish world” to “internal domain world”.

---

## The answer to your “component entanglement” worry

A component *will* necessarily mention “fields” and “presentation” (it renders something). The way you prevent entanglement is:

* Components do **not** construct services, do not call fetch, do not do dependency discovery.
* Components receive:

  * **values** (signals / inputs) and
  * **commands** (outputs / callbacks)
* Stores are the *only* place with the effectful boundary.

So a component becomes a morphism in a very small category: inputs → template output. The data model is imported, not redefined.

---

If you want, the next refinement (still minimal, but more “derived”) is to define a **form schema** as a `Schema.transform` from “stringly HTML input” into your domain `CreateProductWithItemsInput`, so *even parsing* becomes derived/validated rather than ad-hoc. That’s the point where Effect Schema starts paying twice: **validation + parsing** rather than validation alone.


------


According to a document from an unknown date (the code excerpt you attached), your *canonical* “create product with items” payload is already specified denotationally as an `Effect.Schema` object:

* `createProductWithItemsInputSchema : Schema< CreateProductWithItemsInput > = Struct({ product: productInputSchema, items: Array(createItemInputSchema) })`
  and the leaf/domain pieces are similarly canonical (e.g. `productInputSchema`, `createItemInputSchema`, `packSizeSchema`, etc.).

That observation basically answers your (1): **you do not *need* `CreateProductWithItemsMutationVariables` to be “the source of truth”**, because you already have a source of truth (your domain schemas). What GraphQL codegen gives you is *not* “a better domain model”; it gives you *witnesses about the GraphQL boundary*, especially around **operation shapes** (variables + selection sets) and schema drift.

Below is a careful separation of concerns for (1), then (2), then the “standard pattern” you asked for.

---

## 1) Do we actually need generated `...MutationVariables` types?

### The core distinction

Think in terms of (small) categories:

* Let **𝒟** be the category whose objects are your domain schemas/types (Product, Item, ProductInput, CreateItemInput, …) and whose morphisms are total functions between those representations.
* Let **𝒢** be the category of GraphQL types/operations (schema types + concrete operation documents).

Your backend already treats GraphQL as a **presentation functor** out of the domain (“GraphQL should not become the place where semantics live”), i.e. a functor `P : 𝒟 → 𝒢` that “re-expresses” domain schemas as GraphQL types/resolvers.

Now, **GraphQL codegen** gives you *TypeScript-level witnesses* for:

1. **operation variable object shape** (names, optionality, nullability), and
2. **operation result shape** determined by the *selection set*.

Crucially: **(2) cannot be recovered from your domain schemas alone** unless you enforce “always query exactly the full domain shape”. The selection set is a *projection*; even if your domain has `Product`, an operation may return only `{ id }` or `{ id, description }`, etc.

So:

* If you always query the full `ProductWithItems` shape, then generated *result* types are less valuable (still useful for drift detection).
* If you ever query projections/subsets (which is idiomatic GraphQL), generated *result* types become very valuable.

### Where generated `...Variables` types are actually redundant

In your specific code, your *GraphQL arg-shapes* are intentionally aligned with domain inputs (you even comment “GraphQL arg-shape …” in domain inputs). For example:

* `CreateItemInput`’s schema is already the GraphQL arg-shape `{ description?, pack_size }`.
* `CreateProductWithItemsInput` is already `{ product: ProductInput, items: CreateItemInput[] }`.

If your mutation takes exactly one variable (say `$input: CreateProductWithItemsInput!`), then the generated variables type is basically isomorphic to the domain type and adds little.

### A clean compromise I recommend

Use codegen **for typed documents + typed results**, but **treat domain schemas as the source of truth for input validation**.

Concretely:

* Keep codegen so the operation document is checked against the server schema (drift detection).
* Do **not** write frontend code that “models the domain” using generated variable types.
* Instead:

  * Build variables from your domain input type,
  * Validate variables with your domain schema before sending,
  * Decode the response with a schema you define from domain pieces.

This satisfies your “write as little code as possible” constraint: you write *one* thin adapter per operation (a morphism from “form value” into “variables JSON”), not an alternate type universe.

---

## 2) Angular `signal`, `input`, and `model` are different things

### `signal`

A **signal** is Angular’s reactive cell: a value you read by calling it, and update with `set`/`update`. Angular tracks dependencies and updates templates/computed signals accordingly. The official signals guide describes writable vs computed signals and their dependency tracking behavior. ([Angular][1])

Mathematically: you can view a `Signal<A>` as an object in a category of time-varying values; `computed` is (roughly) functorial mapping preserving dependency structure.

### `input`

`input()` declares a **signal-based component input** (returned type: `InputSignal<T>`). It is:

* **written by Angular** when the parent binding changes,
* **read-only** inside the component (you can read `this.someInput()` but cannot `set` it). ([Angular][2])

Angular also supports:

* `input.required<T>()` to enforce at compile-time that the parent must bind it. ([Angular][2])
* **input transforms**: `input(default, { transform })` to normalize/coerce incoming values, and the transform should be pure + statically analyzable. ([Angular][2])

So `input()` is a *boundary morphism* from parent state into child state, but the child cannot mutate it.

### `model`

`model()` declares a **writable signal exposed as an input/output pair**:

* It creates an input named like the property,
* And an output named `${inputName}Change` for two-way bindings. ([Angular][3])
* It is writable (a `ModelSignal` is writable), unlike `InputSignal`. ([Angular][4])

The v18 guide is explicit about differences:

1. `model()` defines both input and output,
2. it is writable (unlike `InputSignal`),
3. **model inputs do not support input transforms** (signal inputs do). ([Angular][4])

So `model()` is appropriate when your component is conceptually a **lens**: it both observes and updates a value on behalf of its parent (think custom form control).

---

## 3) A standard pattern: schema-governed fields as `Signal`-valued validation functors

You asked: “we have schemas for each field … we can always get a validator/parser … so we should have a standard simple pattern … getters/setters that run through validators.”

Yes—but the subtlety is this:

* If your setter *rejects invalid intermediate values*, you make UX terrible (the user cannot type “-” then “-1”, cannot type partial strings, etc.).
* Therefore the standard functional pattern is a **two-level semantics**:

  1. a *raw* signal (`Raw`) that always reflects what the user typed, and
  2. a *validated* signal (`Either<ParseError, A>`) derived from raw by decoding.

This is exactly the pattern “keep syntax separate from semantics”:

* raw text is syntax,
* decoded value is semantics in your domain.

### Minimal reusable helper

```ts
// src/app/core/forms/schema-field.ts
import { computed, signal, type Signal, type WritableSignal } from '@angular/core';
import { Effect, Either, Schema } from 'effect';

export type ParseResult<A> = Either.Either<Schema.ParseError, A>;

const decodeEither =
  <A>(schema: Schema.Schema<A>) =>
  (u: unknown): ParseResult<A> =>
    Effect.runSync(
      Schema.decodeUnknown(schema)(u).pipe(
        Effect.either // Effect<Either<ParseError, A>>
      )
    );

export interface SchemaField<Raw, A> {
  readonly raw: WritableSignal<Raw>;
  readonly parsed: Signal<ParseResult<A>>;
  readonly value: Signal<A | undefined>;
  readonly error: Signal<Schema.ParseError | undefined>;
  readonly isValid: Signal<boolean>;
}

/**
 * Raw state + derived validation.
 * - raw: always settable (tracks user edits)
 * - parsed/value/error: computed from raw using Effect Schema
 */
export const schemaField = <Raw, A>(
  schema: Schema.Schema<A>,
  initialRaw: Raw,
  toUnknown: (raw: Raw) => unknown = (x) => x
): SchemaField<Raw, A> => {
  const raw = signal(initialRaw);

  const parsed = computed(() => decodeEither(schema)(toUnknown(raw())));
  const value = computed(() => (Either.isRight(parsed()) ? parsed().right : undefined));
  const error = computed(() => (Either.isLeft(parsed()) ? parsed().left : undefined));
  const isValid = computed(() => Either.isRight(parsed()));

  return { raw, parsed, value, error, isValid };
};
```

### Why this is “the right abstraction”

Because it’s categorically clean:

* `raw : Signal<Raw>`
* `decode : Raw → Either<ParseError, A>` (a pure function once you run the Effect)
* thus `parsed = decode ∘ raw : Signal<Either<ParseError, A>>`

So you are literally applying a **validation functor** (`Either<ParseError, ->>`) inside the `Signal` context.

### Using it with your existing field schemas

Example: product description.

Your domain defines:

* `productDescriptionSchema : Schema<ProductDescription> = Schema.String`
* `productInputSchema` uses optional + nullable description, aligning with GraphQL input semantics.

So in a form component:

```ts
import { schemaField } from '../core/forms/schema-field';
import { productDescriptionSchema } from '@lect/domain/product/productDescription';

const description = schemaField(productDescriptionSchema, '');
// description.raw(): string
// description.value(): string | undefined
// description.error(): ParseError | undefined
```

Example: pack size.
Your domain says pack size is an `int` number schema and item creation requires `pack_size` plus optional description.

HTML `<input>` gives strings unless you explicitly take `valueAsNumber`. So you either:

* keep raw as `number` (recommended): in the template read `valueAsNumber`, or
* keep raw as `string` and supply `toUnknown = Number`.

The former is less “surprising” and avoids oddities around `NaN`.

---

## 4) Where to attach validation: `input` transforms vs local fields vs `model`

Because Angular *signal inputs* support transforms, you can validate/normalize values at component boundaries:

* `input(..., { transform })` is appropriate when you receive a value from a parent and want to coerce it into a canonical form (trim strings, coerce nullish → default, etc.). ([Angular][2])

But:

* `model()` **does not support transforms** (per the model guide), so you cannot attach schema decoding as a built-in transform on a `model`. ([Angular][4])
  For a `model`, do the same thing as above: keep `model` as raw, and compute a parsed signal from it.

So the standard “lawful” placement is:

* **Within a component**: use `schemaField` for user-editable raw inputs.
* **Across component boundaries**:

  * prefer `input()` for read-only configuration/state,
  * use `model()` only when the component’s purpose is to *edit* a parent-owned value (two-way binding).

This keeps the dependency graph acyclic and legible.

---

## 5) Will the frontend have a separate `Product`, `ProductId`, etc.?

If you extract `src/domain` into a shared package (as you’re already planning), then **no**: the frontend should import:

* `Product`, `ProductId`, `ProductInput`, `CreateItemInput`, `CreateProductWithItemsInput`, …
  from the shared domain package, and use those as the *semantic* types. That’s exactly what your backend architecture already intends: “Domain = pure descriptions of data; GraphQL = presentation.”

What the frontend *will* have additionally are **presentation types** (view-models), e.g.:

* `RemoteData<E, A> = Initial | Loading | Failure<E> | Success<A>`
* “raw form state” records whose leaves are strings/numbers convenient for inputs
* UI-only enriched types (e.g. “isExpanded”, “selectedRowIds”), which are not domain concepts

Those are not competing “domain models”; they are objects in a different category (presentation), and you maintain a small number of explicit morphisms between them and the domain objects.

---

## 6) One extra Angular constraint worth internalizing

Angular’s own signals guide warns against using Angular `effect()` to propagate state (copying one signal into another); prefer `computed()` or `linkedSignal()` for derived state. ([Angular][5])

That advice matches your preferences: keep state flow *explicit and functional*, and use effects only at real side-effect boundaries.

---

If you want, the next concrete step is to take your “create product with items” page and implement it with:

* `schemaField` for each field (description, item description, pack size),
* a computed `Signal<Either<ParseError, CreateProductWithItemsInput>>` that assembles raw fields into the domain input and decodes with `createProductWithItemsInputSchema`,
* a service method `createProductWithItems(input: CreateProductWithItemsInput): Effect<...>` that:

  * sends GraphQL,
  * decodes response into `ProductWithItems` using `productWithItemsSchema`.

And *that* is precisely the point where GraphQL codegen is useful primarily for **typed result selection sets**, not for “re-defining the domain.”

[1]: https://angular.dev/guide/signals "Signals • Overview • Angular"
[2]: https://angular.dev/guide/components/inputs "Accepting data with input properties • Angular"
[3]: https://angular.dev/api/core/model "model • Angular"
[4]: https://v18.angular.dev/guide/signals/model "Model inputs • Angular"
[5]: https://angular.dev/guide/signals/effect "Side effects for non-reactives APIs • Angular"


---


According to a document from **January 20, 2026** (your attached plan + conversation notes), here is a single “master document” that (i) inventories every abstraction we introduced, (ii) pins each one to a concrete place in the module tree, and (iii) lays out build phases.
Links: [angular.md](sandbox:/mnt/data/angular.md), [code.md](sandbox:/mnt/data/code.md)

---

## Architectural laws

### Law 1: One canonical domain; no frontend re-ontology

The frontend **imports** `Product`, `Item`, `CreateProductWithItemsInput`, … from the shared domain package; it does **not** define a second “frontend Product”. The only extra types on the frontend are *presentation objects* (e.g. `RemoteData`, raw form drafts, UI flags), plus explicit morphisms between presentation ↔ domain.

### Law 2: A single Kleisli boundary for side effects

Effects are **run** in one place (the UI runtime), and stores are the only layer allowed to cross from `Effect` into “executed” reality (Promises/signals). Components do not call GraphQL/fetch/effects; they are renderers and event emitters. This yields the linear dependency chain:
[
\textsf{Component} \to \textsf{Store} \to \textsf{Api} \to \textsf{GraphQLClient} \to \textsf{fetch}.
]


### Law 3: GraphQL is “JSON-ish”; schemas reintroduce the law

At the API boundary, treat GraphQL results as untrusted JSON; re-establish invariants by decoding via Effect `Schema`.

### Law 4: Explicit state objects

Async state is made explicit as a small coproduct (`RemoteData = Initial | Loading | Failure | Success`), rather than implicit “isLoading booleans”.

### Law 5: Form semantics factor through validation

User input is *syntax*; domain values are *semantics*. Model this via a raw signal plus a derived `Either<ParseError, A>` computed by schema decoding. The reusable “field functor” is `schemaField`.

---

## Module tree

This is the *target* shape implied by the plan; you should normalize naming to **plural** `features/` (the notes contain both `feature/` and `features/`). The key constraint is: `features/**` may depend on `api/**` and `core/**`, but not conversely.

```txt
packages/
  domain/                      # extracted from backend src/domain (schemas/types/arbitraries)
    src/
    package.json

apps/
  server/                      # your existing backend (Yoga GraphQL etc.)
  web/                         # Angular app
    codegen.ts                 # GraphQL codegen config (optional but recommended)
    proxy.conf.json            # dev proxy to backend /graphql
    src/app/
      main.ts
      app.config.ts
      app.routes.ts
      app.component.ts

      gql/                     # GENERATED by GraphQL Code Generator (typed document strings/types)

      core/
        effect/
          ui-runtime.ts        # ManagedRuntime boundary (the “runner”)
          remote-data.ts       # RemoteData algebra
        graphql/
          graphql-client.ts    # Effect service tag + live Layer (fetch)
          graphql-errors.ts    # tagged error coproduct for API failures
        forms/
          schema-field.ts      # schemaField helper for raw+validated form fields

      api/
        hello.api.ts
        product.api.ts
        item.api.ts
        ...                    # “one file per operation group” is fine

      features/
        hello/
          hello.store.ts
          hello.page.ts
        products/
          create-product.store.ts
          create-product-form.component.ts
          create-product-result.component.ts
          create-product.page.ts
          products.store.ts
          products.page.ts
          ...                  # feature-local VMs optional
```

---

## Abstraction catalog

### A. Shared domain package `@lect-effect/domain`

**What it is:** the canonical objects + schemas (and therefore generators/arbitraries) shared by backend and frontend.
**Where:** `packages/domain/src/**` (exported via `packages/domain/src/index.ts`).
**Why it matters:** it keeps the domain as the terminal object of “meaning”; everything else is a projection/presentation.

**Testing payoff:** you already derive property-based generators from schemas on the backend (e.g. `Arbitrary.make(productSchema)` etc.), so the same move remains available in the frontend.

---

### B. GraphQL code generation (compile-time witness)

**What it is:** a compile-time functor from GraphQL schema + documents → typed document strings + (optionally) result/variables TS types.
**Where:**

* Config: `apps/frontend/codegen.ts`
* Generated output: `apps/frontend/src/app/gql/**`
* Documents: either `src/app/**/*.graphql` or TS-colocated documents depending on your chosen config.

**Key decision (minimal runtime):** `documentMode: "string"` (typed *strings*, no GraphQL AST/printing shipped to browser).

**Important nuance (your point (1)):**
If your GraphQL variables are already intentionally isomorphic to domain input types (as your code suggests), then generated `...Variables` types are often redundant. A clean compromise is: use codegen mainly for (i) typed documents and (ii) typed *results* (drift detection + projection typing), while treating domain schemas as the source of truth for input validation and construction.

---

### C. `GraphQLClient` (Effect service boundary for HTTP)

**What it is:** the minimal “ambient functor” from HTTP (`fetch`) into `Effect`, tagged as a service so it composes via layers.
**Where:** `apps/frontend/src/app/core/graphql/graphql-client.ts`.

**Associated error coproduct:** `apps/frontend/src/app/core/graphql/graphql-errors.ts` defines tagged errors (`GraphQLTransportError`, `GraphQLHttpError`, `GraphQLResponseError`, etc.).

**Codegen interoperability:** the client should accept a structural “document string” (anything with `toString(): string`), which is exactly what typed document strings provide.

---

### D. `UiRuntime` (the only executor)

**What it is:** a single `ManagedRuntime` living in Angular DI, i.e. the “place where effects occur”.
**Where:** `apps/frontend/src/app/core/effect/ui-runtime.ts` (or `ui-runtime.service.ts` in the notes).

**Why it matters:** it is the unique natural transformation
[
\textsf{Effect} \Rightarrow \textsf{Promise/Signals}
]
that you permit in the codebase (everything else stays in the Kleisli category).

---

### E. `RemoteData<E, A>` (explicit async state algebra)

**What it is:** a tiny coproduct encoding async state.
**Where:** `apps/frontend/src/app/core/effect/remote-data.ts`.

**Why it matters:** you can pattern-match state in templates (`@switch`, `@if`) without hidden conventions.

---

### F. `schemaField` (schema-governed form fields)

**What it is:** a reusable constructor for a *raw* writable signal plus derived validation signals:

* `raw : WritableSignal<Raw>`
* `parsed : Signal<Either<ParseError, A>>`
* `value/error/isValid` derived from `parsed`

**Where:** `apps/frontend/src/app/core/forms/schema-field.ts`.

**Why it’s “lawful”:** it is literally composition in the functor category:
[
\textsf{Signal}(\textsf{Either}(\textsf{ParseError}, -)).
]
So you separate *typing in time* (signals) from *typing by schema* (either/parse).

---

### G. Angular signal taxonomy (so you don’t build a rat’s nest)

**What it is:** a precise distinction between three different boundary notions:

* `signal()` = local reactive cell (read/write)
* `input()` = read-only signal input (written by Angular)
* `model()` = writable signal paired with an output for two-way binding (lens-like component)

**Where:** this is a *component-layer convention*, but the definitions are described in the plan notes and should be encoded as team rules + code review checklist.

**Practical placement rule:** user-editable fields → `schemaField` (raw + validated), component boundaries → prefer `input()`; use `model()` only when the component is intentionally a lens/editor.

---

### H. API modules (GraphQL documents + schema decoding)

**What it is:** “one file per API surface area” containing functions returning `Effect<Domain, Error, GraphQLClient>`:

1. validate input via domain schema (even if “frontend made it”)
2. execute GraphQL
3. decode output via schema built from domain pieces

**Where:** `apps/frontend/src/app/api/*.ts` (or `feature/*/*.api.ts` in the Hello slice—normalize to `api/`).

---

### I. Stores (route/feature-local state machines)

**What it is:** per-route coalgebras producing signals; commands trigger effect execution through `UiRuntime` and update the signals with `RemoteData` results.
**Where:** `apps/frontend/src/app/features/**/**.store.ts` (e.g. `hello.store.ts`, `products.store.ts`, `create-product.store.ts`).

**Optional refinement:** “latest-wins” epoch gating to avoid stale overwrites when concurrent requests race.

---

### J. Components (presentational morphisms + event wiring)

**What they are:** standalone components with `OnPush`, fed by store signals and exposing outputs; no dependency discovery, no GraphQL, no effect running.

**Where:**

* Pages: `features/**/**.page.ts` (inject/provide the store, wire components together).
* Presentational components: e.g. result component uses `input.required<RemoteData<...>>()`.

**“Component entanglement” resolution:** factorization: domain values come from stores; stores are the only effect boundary; components are just morphisms `Signals → DOM`.

---

### K. Bootstrap + zoneless + OnPush defaults

**What it is:** standalone bootstrap + explicit zoneless change detection; no Zone.js implicit propagation.
**Where:** `main.ts`, `app.config.ts`, `app.component.ts`.

---

### L. Dev proxy

**What it is:** make `/graphql` resolve to backend during `ng serve` without hardcoding `http://localhost:4000` in browser code.
**Where:** `apps/frontend/proxy.conf.json`.

---

### M. Testing harness (symmetry with backend)

**What it is:** store and API tests that do not need Angular rendering; inject a fake `GraphQLClient` layer and run effects deterministically; keep property-based tests by reusing `Schema`-derived arbitraries (same move you already use in backend tests).

---

## Build phases

I’m describing these as a chain of “prove small lemmas, then compose them” rather than one big bang.

### Phase 0 — Extract and publish the shared domain

**Goal:** `packages/domain` exists and both backend + frontend compile against it.
**Exit condition:** backend tests still pass; frontend can import schemas/types (even before UI exists). (This is the precondition referenced throughout the plan.)

---

### Phase 1 — Angular skeleton with explicit reactivity

**Build:**

* `main.ts` + `app.config.ts` with `provideZonelessChangeDetection()`
* enforce `ChangeDetectionStrategy.OnPush` in all components

**Exit condition:** empty page boots and renders (no services yet).

---

### Phase 2 — Core “edge” layer

**Build:**

* `core/graphql/graphql-errors.ts`
* `core/graphql/graphql-client.ts` (Effect service + Layer)
* `core/effect/ui-runtime.ts` (ManagedRuntime boundary)
* `core/effect/remote-data.ts`

**Exit condition:** you can run a trivial `Effect` through `UiRuntime` and observe a signal update in a toy store.

---

### Phase 3 — First end-to-end slice: Hello

**Build:**

* `api/hello.api.ts` (schema-validated input + schema-decoded output)
* `features/hello/hello.store.ts`
* `features/hello/hello.page.ts`
* route wiring

**Exit condition:** one route, one store; you can type a name and see a decoded greeting. The important proof is: “GraphQL is untyped JSON; schemas reintroduce a law.”

---

### Phase 4 — Form semantics abstraction

**Build:**

* `core/forms/schema-field.ts`

**Exit condition:** you can model a field as raw+validated without Angular Forms machinery, and components remain “almost pure” (local draft state only).

---

### Phase 5 — Second end-to-end slice: Create Product With Items (two components)

**Build:**

* `api/product.api.ts` (validate `CreateProductWithItemsInput` via shared schema; decode `ProductWithItems` via shared schema)
* `features/products/create-product.store.ts`
* `features/products/create-product-form.component.ts`
* `features/products/create-product-result.component.ts`
* `features/products/create-product.page.ts` tying them together

**Exit condition:** the linear dependency chain is visibly enforced, and you can create a product and render the result.

---

### Phase 6 — Mechanize GraphQL drift detection (codegen)

**Build:**

* `apps/frontend/codegen.ts`
* generate `src/app/gql/**`
* update GraphQL client to accept `toString()`-able documents (structural)

**Exit condition:** `pnpm -C apps/frontend codegen` produces typed documents; operations are checked against the running schema; runtime decoding still uses Effect schemas.

**Note:** per the compromise in the notes, do **not** let generated variable types become your “domain”; keep domain schemas as truth and treat codegen as compile-time witness (especially valuable for *result projections*).

---

### Phase 7 — Testing phase

**Build:**

* unit tests for API modules with a mock `GraphQLClient`
* unit tests for stores with a mock runtime/layer
* property-based tests by importing the same domain schemas (and generators) you already use on the backend

**Exit condition:** you can falsify store laws (loading→success/failure transitions) without Angular rendering, and you can generate valid/invalid inputs from schemas.

---

### Phase 8 — Optional refinements (only if pain appears)

These are not required for the MWE, but are “adjoints you can add later”:

* feature-local **VM** modules so presentational components depend on `*VM` types, not full domain objects (discussed as an optional refinement)
* caching policies inside stores (explicit maps/signals), not hidden Apollo-like policies (already implied by “GraphQL client minimal”)

---

If you want, the next actionable artifact I can produce is a **single checklist** (per phase) with: exact file paths, the minimal exported symbols per file, and the minimal “compile witness” you should see at each step (e.g. which imports should resolve, which stores should type-check, which codegen outputs should exist).


------

Here are **phase-by-phase checklists** you can literally tick off. I’m treating each phase as a small lemma whose “proof” is a concrete build/run/test predicate; later phases compose these lemmas into the full frontend factorization.

Links to the two reference artifacts you attached:

* [angular.md](sandbox:/mnt/data/angular.md)
* [code.md](sandbox:/mnt/data/code.md)



---

## Global invariants to enforce from day 1

These are “structural laws” you want to remain true as the codebase grows (they constrain the dependency graph).

* [ ] **Standalone components** only (no NgModules), `bootstrapApplication`.
* [ ] **Zoneless** Angular: `provideZonelessChangeDetection()` in `app.config.ts`.
* [ ] **OnPush** on every component (renderer is “pure in signals”).
* [ ] **One Kleisli boundary**: only *stores* are allowed to run Effects (via `UiRuntime`).
* [ ] **GraphQL treated as untrusted JSON**; decode at API boundary via **shared Effect Schemas**.
* [ ] `features/**` may depend on `api/**` and `core/**`; **never** the reverse.

You can treat these as the “typing rules” of the frontend category.

---

# Phase 0 — Workspace + shared domain package

### Goal

`src/domain/**` becomes `packages/domain/**` and is imported by both backend and frontend as `@lect-effect/domain` (or whatever name you choose). No duplicate domain ontology.

### Checklist

**Workspace plumbing**

* [ ] Add `pnpm-workspace.yaml` at repo root with:

  * [ ] `"."`
  * [ ] `"packages/*"`
  * [ ] `"apps/*"` (even if `apps/frontend` doesn’t exist yet)

**Create domain package**

* [ ] Create `packages/domain/package.json`

  * [ ] `name: "@lect-effect/domain"` (or your chosen scope)
  * [ ] depends on `effect`
  * [ ] has `"build": "tsc -p tsconfig.json"`
* [ ] Create `packages/domain/tsconfig.json` targeting `dist/` + declarations.
* [ ] Create `packages/domain/src/index.ts` exporting domain modules (can start minimal; expand later).

**Move domain**

* [ ] `git mv src/domain packages/domain/src`
* [ ] Ensure internal imports inside domain remain valid (they’re still relative).

**Rewire backend to shared domain**

* [ ] Root `package.json`: add dependency `"@lect-effect/domain": "workspace:*"`.
* [ ] Replace backend imports:

  * [ ] `../domain/...` → `@lect-effect/domain/...`
  * [ ] `./src/domain/...` → `@lect-effect/domain/...`
* [ ] Ensure backend build runs domain build first:

  * [ ] root script `build`: `pnpm -C packages/domain build && tsc`
  * [ ] do the same for any test script that typechecks/executes imports.

**Verification (proof obligations)**

* [ ] `pnpm install`
* [ ] `pnpm -C packages/domain build`
* [ ] `pnpm build` (backend compiles)
* [ ] `./tests.sh` (or your standard test arrow)

**Exit criteria**

* [ ] Backend passes its existing tests **without** importing `src/domain/**` anywhere.

---

# Phase 1 — Angular skeleton (standalone + zoneless + OnPush)

### Goal

An Angular app exists and boots with the “explicit reactivity” defaults (zoneless + signals).

### Checklist

**Create Angular app**

* [ ] Create `apps/frontend/` via Angular CLI (standalone + routing + zoneless).
* [ ] `pnpm install` at workspace root.

**Wire zoneless**

* [ ] `apps/frontend/src/app/app.config.ts` includes:

  * [ ] `provideZonelessChangeDetection()`

**Enforce OnPush**

* [ ] Ensure `AppComponent` sets `ChangeDetectionStrategy.OnPush`.

**Wire dev proxy**

* [ ] Add `apps/frontend/proxy.conf.json` that routes `/graphql` → backend server.
* [ ] `apps/frontend/package.json` start script uses `--proxy-config proxy.conf.json`.

**Add shared deps**

* [ ] `pnpm -C apps/frontend add effect @lect-effect/domain@workspace:*`

**Verification**

* [ ] `pnpm -C apps/frontend start`
* [ ] Browser loads root route and renders “hello world” template.

**Exit criteria**

* [ ] Angular boots zoneless and renders a standalone component.

---

# Phase 2 — Core “edge” layer: GraphQL client + Effect runtime + RemoteData

### Goal

You can run one Effect from a store and observe a signal update. No feature logic yet.

### Checklist

**Create core modules**

* [ ] `apps/frontend/src/app/core/effect/remote-data.ts`

  * [ ] `RemoteData = Initial | Loading | Failure | Success`
* [ ] `apps/frontend/src/app/core/graphql/graphql-errors.ts`

  * [ ] tagged error coproduct for transport/http/graphql errors
* [ ] `apps/frontend/src/app/core/graphql/graphql-client.ts`

  * [ ] Effect `Tag` (or `GenericTag`) for `GraphQLClient`
  * [ ] `GraphQLClientLive(endpoint)` Layer using `fetch`
* [ ] `apps/frontend/src/app/core/effect/ui-runtime.ts`

  * [ ] `ManagedRuntime.make(AppLayer)`
  * [ ] a method returning `Exit` or `Either` (pick one and stick to it)

**Add a toy store to prove the boundary**

* [ ] Create a tiny store that:

  * [ ] has `signal(RemoteData.initial())`
  * [ ] runs a trivial Effect (e.g. `Effect.succeed(123)`) through `UiRuntime`
  * [ ] writes `Success(123)` into a signal

**Verification**

* [ ] Angular page renders the store’s state.
* [ ] Clicking a button triggers the toy Effect and updates the UI.

**Exit criteria**

* [ ] The “only stores run Effects” discipline is physically true in code.

---

# Phase 3 — First end-to-end slice: Hello (thin API, store, page)

### Goal

Prove the main factorization on the smallest possible operation:
`component → store → api → graphql-client → fetch → graphql → decode`.

### Checklist

**API module**

* [ ] `apps/frontend/src/app/api/hello.api.ts`

  * [ ] uses `GraphQLClient.request(...)`
  * [ ] validates variables (input) via **shared domain schema**
  * [ ] decodes response via **shared domain schema**

**Feature module**

* [ ] `apps/frontend/src/app/features/hello/hello.store.ts`

  * [ ] state: `RemoteData<Err, HelloResponse>`
  * [ ] command: `run(name)` triggers the Effect and updates signal
* [ ] `apps/frontend/src/app/features/hello/hello.page.ts`

  * [ ] OnPush
  * [ ] reads store signals, wires button click → store command

**Routing**

* [ ] `app.routes.ts` route `"" → HelloPage`

**Verification**

* [ ] Backend running (`./run.sh` or `pnpm start`)
* [ ] Angular running (`pnpm -C apps/frontend start`)
* [ ] Clicking “Greet” produces a decoded greeting (Success state)

**Exit criteria**

* [ ] Your frontend can perform a real GraphQL round-trip and decode with Effect Schemas.

---

# Phase 4 — Form semantics: `schemaField` (raw ↦ Either(ParseError, A))

### Goal

Introduce the reusable abstraction for field-level parsing/validation without adopting Angular Forms complexity.

### Checklist

**Implement the abstraction**

* [ ] `apps/frontend/src/app/core/forms/schema-field.ts`

  * [ ] `schemaField(schema, initialRaw, toUnknown?)`
  * [ ] returns:

    * [ ] `raw: WritableSignal<Raw>`
    * [ ] `parsed: Signal<Either<ParseError, A>>`
    * [ ] `value/error/isValid` derived

**Prove it in a small component**

* [ ] Update `HelloPage` or create a tiny “schema-field demo” component:

  * [ ] raw string input
  * [ ] show “valid/invalid” based on `isValid`

**Verification**

* [ ] Typing invalid values does not break typing UX (raw always updates)
* [ ] Validity signal toggles as expected

**Exit criteria**

* [ ] You have a standard pattern for “syntax vs semantics” at the field level.

---

# Phase 5 — Second end-to-end slice: Create Product With Items page (2 components)

### Goal

Demonstrate the full architecture on a mutation + nontrivial payload:

* Component A: **form input** (raw + validated) → emits **validated domain value**
* Store: runs effect and stores result as `RemoteData`
* Component B: renders the result

### Checklist

**API**

* [ ] `apps/frontend/src/app/api/product.api.ts`

  * [ ] `createProductWithItems(input: unknown)`:

    * [ ] decode input with `createProductWithItemsInputSchema`
    * [ ] call mutation via `GraphQLClient`
    * [ ] decode response with `{ createProductWithItems: productWithItemsSchema }`

**Store**

* [ ] `apps/frontend/src/app/features/products/create-product.store.ts`

  * [ ] `created: Signal<RemoteData<Err, ProductWithItems>>`
  * [ ] `create(input)` sets Loading → Success/Failure

**Component A: form**

* [ ] `apps/frontend/src/app/features/products/create-product-form.component.ts`

  * [ ] uses `schemaField` for leaf fields (description, pack size, etc.)
  * [ ] has a computed `Either<ParseError, CreateProductWithItemsInput>` for whole form
  * [ ] emits `submitted: CreateProductWithItemsInput` (already validated)

**Component B: result**

* [ ] `apps/frontend/src/app/features/products/create-product-result.component.ts`

  * [ ] `input.required<RemoteData<Err, ProductWithItems>>()`
  * [ ] pure renderer (no services)

**Page composition**

* [ ] `apps/frontend/src/app/features/products/create-product.page.ts`

  * [ ] provides store
  * [ ] wires `(submitted) → store.create($event)`
  * [ ] passes store signal into result component

**Routing**

* [ ] Add a route (or make it the root route temporarily)

**Verification**

* [ ] With backend running, submitting form creates product+items
* [ ] UI shows Loading → Success with returned IDs and fields

**Exit criteria**

* [ ] You have the “two components + service call + result display” pattern working end-to-end.

---

# Phase 6 — Mechanize GraphQL drift detection (codegen)

### Goal

Introduce GraphQL Code Generator as a compile-time witness:

* typed documents,
* typed result shapes (especially valuable for projections),
  while *keeping domain schemas as runtime truth*.

### Checklist

**Install**

* [ ] `pnpm -C apps/frontend add -D @graphql-codegen/cli @graphql-codegen/client-preset graphql`

**Add documents**

* [ ] Put operation documents in one consistent place:

  * [ ] `apps/frontend/src/app/graphql/*.graphql` (recommended)
  * [ ] include the `CreateProductWithItems` mutation document

**Codegen config**

* [ ] `apps/frontend/codegen.ts`

  * [ ] `schema: "http://localhost:4000/graphql"` (MWE)
  * [ ] `preset: "client"`
  * [ ] `documentMode: "string"` (typed document strings)

**Generated output**

* [ ] `apps/frontend/src/app/gql/**` is generated (gitignored or not—your call)

**Scripts**

* [ ] `apps/frontend/package.json` has:

  * [ ] `"codegen": "graphql-codegen --config codegen.ts"`
  * [ ] `"prebuild": "pnpm codegen"` (or equivalent)

**Client interoperability**

* [ ] Update `GraphQLClient.request` to accept `string | { toString(): string }`

**API migration**

* [ ] Update `product.api.ts` to use generated document string rather than embedding raw string.
* [ ] Keep schema decode step unchanged.

**Verification**

* [ ] With backend running: `pnpm -C apps/frontend codegen` succeeds
* [ ] Break a field name in the `.graphql` document → codegen/typecheck fails (expected)
* [ ] Restore → build succeeds

**Exit criteria**

* [ ] Operation documents are checked against the live schema, but runtime semantics remain governed by Effect Schema decoders.

---

# Phase 7 — Testing harness (store/API unit tests, property tests later)

### Goal

You can test stores and API modules without rendering Angular components, by substituting the GraphQL client Layer.

### Checklist

**API tests**

* [ ] Add tests that provide a fake `GraphQLClient` Layer returning deterministic JSON.
* [ ] Assert:

  * [ ] invalid input fails schema decode
  * [ ] invalid response fails schema decode
  * [ ] valid response yields domain value

**Store tests**

* [ ] Construct store with a test runtime / stub `UiRuntime` that runs Effects immediately.
* [ ] Assert transitions:

  * [ ] `Initial → Loading → Success`
  * [ ] `Initial → Loading → Failure`

**Optional property tests**

* [ ] Use shared domain schemas to derive arbitraries for valid inputs.
* [ ] Property: for generated valid input, store eventually reaches Success given a consistent fake response.

**Verification**

* [ ] `pnpm -C apps/frontend test` (Vitest) green

**Exit criteria**

* [ ] You can falsify/store-check behavior without browser or Angular TestBed.

---

# Phase 8 — Optional refinements (only if/when pain appears)

You do **not** need these to start building productively.

* [ ] **Feature-local VM modules** (`features/products/*.vm.ts`) so presentational components never import full domain objects.
* [ ] **Latest-wins epochs** in stores to avoid stale overwrites under concurrency.
* [ ] **Caching** as explicit store signals (not hidden client cache policy).
* [ ] **Dual ESM/CJS** packaging for `@lect-effect/domain` if Angular warns about CJS (optimize later).

---

## One-page “Where am I?” progress tracker

You can keep this as a single checklist:

* [ ] Phase 0 complete (shared domain)
* [ ] Phase 1 complete (Angular skeleton)
* [ ] Phase 2 complete (core edge)
* [ ] Phase 3 complete (Hello E2E)
* [ ] Phase 4 complete (schemaField)
* [ ] Phase 5 complete (CreateProductWithItems E2E w/ 2 components)
* [ ] Phase 6 complete (codegen)
* [ ] Phase 7 complete (tests)
* [ ] Phase 8 (optional)

---

If you tell me which phase you are starting from (0 vs 1 vs 2), I can also give you a **minimal diff-set** for just the next phase (the smallest patch that satisfies the exit criteria), but the lists above should already let you proceed monotonically without ambiguity.

-----

Below is a revised **Phase 0** (workspace + shared domain extraction) that produces an **ESM** `@lect-effect/domain` package, compatible with your backend now being `"type": "module"`.

The only “new” ESM-specific obligations vs the old CJS plan are:

* the domain package must be `"type": "module"` (not `commonjs` as previously suggested), and
* **all relative imports inside the domain package must be ESM-correct**, i.e. include **`.js`** in the specifier (because the emitted files are `.js`). Your current domain files use extensionless relative imports like `./greeting`, which is the classic place ESM breaks if you run the emitted code directly in Node.

---

## Phase 0 — Workspace + shared domain package (ESM edition)

### 0.1 Workspace plumbing

* [ ] Add `pnpm-workspace.yaml` at repo root:

```yaml
packages:
  - "."
  - "packages/*"
  - "apps/*"
```

This makes “packages” the objects of your repo, with workspace linking acting like an inclusion functor from each package into the whole.

---

## 0.2 Create `packages/domain` as an ESM library

### 0.2.1 Create directories

* [ ] Create:

```bash
mkdir -p packages/domain/src
```

### 0.2.2 `packages/domain/package.json` (ESM + deep imports)

* [ ] Create `packages/domain/package.json`:

```json
{
  "name": "@lect-effect/domain",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./*": {
      "types": "./dist/*.d.ts",
      "import": "./dist/*.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "effect": "^3.19.14"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

Notes (ESM-critical):

* The `exports` map keeps **deep imports** working (`@lect-effect/domain/hello/nameInput`) by mapping `./*` → `./dist/*.js`.
* We include `.js` in the export targets because Node’s resolution at runtime is literal (no extension inference).

### 0.2.3 `packages/domain/tsconfig.json`

* [ ] Create `packages/domain/tsconfig.json`:

```json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",

    "declaration": true,
    "declarationMap": true,

    "noEmit": false,

    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

This “chooses” the ESM doctrine explicitly: the emitted JS is ESM, and TypeScript will accept `.js` specifiers in your `.ts` sources and map them to `.ts` at typecheck time.

### 0.2.4 Minimal barrel

* [ ] Create `packages/domain/src/index.ts`:

```ts
export * from "./errors.js";
```

(You can add more later; deep-imports mean you don’t need a huge barrel immediately.)

---

## 0.3 Move domain sources into the new package

* [ ] Move the domain tree:

```bash
git mv src/domain/* packages/domain/src/
rmdir src/domain
```

This preserves your internal domain shape (hello/item/product/errors) exactly as-is.

---

## 0.4 ESM fixup: make all *relative* imports in domain use `.js`

This is the key ESM delta.

### 0.4.1 What to change

Inside `packages/domain/src/**`, any import like:

```ts
import { greetingSchema } from './greeting';
```

must become:

```ts
import { greetingSchema } from './greeting.js';
```

Your current domain code has the extensionless form (example: `helloResponse.ts` imports `./greeting`), and similarly in other files (`nameInput.ts` imports `./name`, etc.).

### 0.4.2 Mechanical checklist for fixup

* [ ] Run a grep to find relative imports without `.js`:

```bash
git grep -nE "from '\\./|from \"\\./" packages/domain/src
```

* [ ] For each match where the specifier is relative (`./` or `../`) and has no extension:

  * [ ] append `.js` to the import/export specifier.

You are aiming for the invariant:

> In the ESM subcategory of modules, all relative edges are labeled by resolvable `.js` morphisms.

---

## 0.5 Rewire the backend to import from `@lect-effect/domain`

Now replace all backend imports that reached into `src/domain/...` with package imports.

Example (from your current backend): the greeting service imports domain via `../../domain/hello/greeting`. After extraction it becomes:

```ts
import { greetingSchema } from "@lect-effect/domain/hello/greeting";
```

### 0.5.1 Mechanical checklist

* [ ] Replace `../domain/...` and `../../domain/...` etc everywhere in `src/**` and `test/**` with `@lect-effect/domain/...`.
* [ ] Confirm there are **no** remaining imports from `src/domain` (since the folder is gone).

Useful search:

```bash
git grep -n "domain/" src test
```

---

## 0.6 Add the workspace dependency + build ordering

### 0.6.1 Root `package.json`: add dependency

* [ ] In root `package.json` add:

```json
"dependencies": {
  "@lect-effect/domain": "workspace:*",
  ...
}
```

### 0.6.2 Root scripts: build domain first

Because `@lect-effect/domain` will be consumed via its `dist/**` exports, you want the domain to be built **before** the backend compiles/tests.

* [ ] Update root scripts:

```json
"scripts": {
  "build": "pnpm -C packages/domain build && tsc",
  "buildtest": "pnpm run build && pnpm run typecheck:test",
  "start": "pnpm run build && node dist/index.js",
  ...
}
```

(Your `buildtest` already composes `build` → `typecheck:test`, so making `build` build domain first is the minimal way to preserve the proof chain.)

---

## 0.7 Update tests that used `src/domain/**`

Your domain tests currently live under `test/domain/**` (per repo structure) and will have imported from `src/domain/...`.

* [ ] Update test imports to `@lect-effect/domain/...`.
* [ ] Do **not** import from `packages/domain/src/**` from outside the domain package; keep the boundary strict.

---

## 0.8 Verification obligations

This phase is complete when the following “judgments” hold:

* [ ] `pnpm install`
* [ ] `pnpm -C packages/domain build`
* [ ] `pnpm build`
* [ ] `pnpm test` (or `./tests.sh`)

### If you hit an error

**If Node throws `ERR_MODULE_NOT_FOUND` for a relative path**, it almost always means:

* some emitted file still contains `from "./something"` instead of `from "./something.js"` (in either the domain package, or anywhere else you run as ESM).

The local repair is always the same: fix the *relative* specifier to include `.js`.

---

## What changed from the old plan

The previous plan explicitly recommended `"type": "commonjs"` for `@lect-effect/domain` to avoid `ERR_REQUIRE_ESM` with a CJS backend. That premise is gone: your backend is now ESM, so the correct factorization is ESM–ESM, and the main new constraint is the `.js`-qualified relative import discipline inside the domain package.

---

If you want, the next useful artifact after you implement Phase 0 is a **single “diff witness” file** (a tiny backend module) that imports 2–3 schemas from `@lect-effect/domain/**` and runs a `Schema.decodeUnknown` against a hardcoded value—i.e. a minimal morphism that demonstrates the new boundary is actually composable.

-----


Below are **re-expanded, implementation-grade checklists** for **Phase 1** and **Phase 2**, assuming **Phase 0 is complete**: you now have a separate ESM workspace package `@lect-effect/domain` that both backend and frontend can import.

I’m staying faithful to the plan’s stated Phase 1/2 goals and artifacts (zoneless + OnPush; then core “edge” layer with `RemoteData`, `GraphQLClient`, `UiRuntime`, and a toy store).

---

## Phase 1 — Angular skeleton

Goal: *An Angular app exists and boots with explicit reactivity defaults (zoneless + signals), and can import `@lect-effect/domain` + `effect`.*

### Phase 1 checklist

#### 1. Workspace plumbing sanity (should already be true after Phase 0)

* [ ] `pnpm-workspace.yaml` includes:

  * [ ] `"packages/*"`
  * [ ] `"apps/*"` (so `apps/frontend` is a workspace object)
* [ ] `pnpm install` at repo root completes without peer-dep drama.

*(If this is already satisfied from Phase 0, treat it as a discharged lemma and move on.)*

#### 2. Scaffold the Angular app into `apps/frontend`

* [ ] From repo root, scaffold **standalone + routing + zoneless**:

  * [ ] Run:

    ```bash
    pnpm dlx @angular/cli@latest new web \
      --directory apps/frontend \
      --package-manager pnpm \
      --routing \
      --style scss \
      --zoneless \
      --skip-git \
      --skip-install
    ```
* [ ] Install all workspace deps:

  * [ ] Run from repo root:

    ```bash
    pnpm install
    ```

This matches the plan’s “create `apps/frontend/` via Angular CLI (standalone + routing + zoneless)”.

#### 3. Add shared deps in the **frontend package**

* [ ] Add Effect + shared domain as dependencies of `apps/frontend`:

  * [ ] Run:

    ```bash
    pnpm -C apps/frontend add effect @lect-effect/domain@workspace:*
    ```
  * [ ] (If you prefer, pin exactly to workspace root: `@lect-effect/domain@workspace:*` is the intended “inclusion functor” here.)

This is explicitly called out in the plan.

#### 4. Ensure zoneless is actually wired

* [ ] Open `apps/frontend/src/app/app.config.ts`
* [ ] Ensure `provideZonelessChangeDetection()` is present in the providers list:

  * [ ] Something like:

    ```ts
    import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";
    import { provideRouter } from "@angular/router";
    import { routes } from "./app.routes";

    export const appConfig: ApplicationConfig = {
      providers: [provideRouter(routes), provideZonelessChangeDetection()]
    };
    ```
* [ ] Sanity check: search for Zone usage

  * [ ] `rg "zone\.js|Zone" apps/frontend/src` should be empty (or at least not imported by your app entry).

This is the plan’s “Wire zoneless” bullet.

#### 5. Enforce `OnPush` in the root component

* [ ] In `apps/frontend/src/app/app.component.ts`:

  * [ ] Set `changeDetection: ChangeDetectionStrategy.OnPush`
  * [ ] (Optional but recommended) remove unused mutable patterns from the generated template.

This is explicitly required by the plan.

#### 6. Wire a dev proxy for `/graphql`

You want the browser to talk to the backend without CORS and without smuggling the backend URL into code.

* [ ] Create `apps/frontend/proxy.conf.json`:

  * [ ] Minimal:

    ```json
    {
      "/graphql": {
        "target": "http://localhost:4000",
        "secure": false,
        "changeOrigin": true
      }
    }
    ```
* [ ] Update `apps/frontend/package.json` start script:

  * [ ] Ensure it uses:

    * [ ] `ng serve --proxy-config proxy.conf.json`

Again: exactly as required in the plan.

#### 7. Phase 1 verification (proof obligations)

* [ ] Build the domain once (important if `@lect-effect/domain` is consumed from its `dist/`):

  * [ ] Run:

    ```bash
    pnpm -C packages/domain build
    ```
* [ ] Start Angular:

  * [ ] Run:

    ```bash
    pnpm -C apps/frontend start
    ```
* [ ] Browser loads root route; the app renders.
* [ ] Add a *temporary* import witness (then delete):

  * [ ] In some file imported by the app (e.g. `app.component.ts`), add:

    ```ts
    import { Schema } from "effect";
    import * as Domain from "@lect-effect/domain";
    void Schema;
    void Domain;
    ```
  * [ ] Confirm: `ng serve` still compiles.

#### 8. Phase 1 exit criteria

* [ ] Angular boots **zoneless**, root component is **OnPush**, and the app compiles while importing `effect` + `@lect-effect/domain`.

---

## Phase 2 — Core edge layer

Goal: *You can run one `Effect` from a store (and only from a store) and observe a `Signal` update. You also lay down the GraphQL client + error coproduct + runtime bridge, even if the toy effect is not yet a real GraphQL call.*

In categorical terms: we are constructing the *Kleisli boundary* explicitly. UI components live in the ordinary category of pure renderers-from-signals; stores are the only morphisms into the Kleisli category `Signal ⟶ Effect ⟶ Signal`.

### Phase 2 checklist

#### 1. Create the core module tree (files + exports)

Create these files (exact paths from the plan):

* [ ] `apps/frontend/src/app/core/effect/remote-data.ts`
* [ ] `apps/frontend/src/app/core/graphql/graphql-errors.ts`
* [ ] `apps/frontend/src/app/core/graphql/graphql-client.ts`
* [ ] `apps/frontend/src/app/core/effect/ui-runtime.ts`

Keep these “core” modules **acyclic** and dependency-minimal.

#### 2. Implement `RemoteData`

* [ ] In `core/effect/remote-data.ts` define:

  * [ ] `RemoteData<E, A> = Initial | Loading | Failure<E> | Success<A>`
  * [ ] constructors:

    * [ ] `RemoteData.initial()`
    * [ ] `RemoteData.loading()`
    * [ ] `RemoteData.failure(e)`
    * [ ] `RemoteData.success(a)`

This is explicitly in the Phase 2 plan checklist.

#### 3. Implement a tagged error coproduct for GraphQL transport

* [ ] In `core/graphql/graphql-errors.ts`, define errors as a **sum type** (tagged union):

  * [ ] `TransportError` (fetch threw / network)
  * [ ] `HttpError` (non-2xx status)
  * [ ] `GraphqlError` (GraphQL `errors` array present)
  * [ ] `DecodeError` (Effect Schema decode failed)
* [ ] Make them structurally comparable / printable (Effect’s `Data.TaggedError` is a good fit).

This is explicitly required (“tagged error coproduct for transport/http/graphql errors”).

#### 4. Implement `GraphQLClient` as an Effect service + Layer

* [ ] In `core/graphql/graphql-client.ts`:

  * [ ] Define a `Tag` / `GenericTag` for `GraphQLClient` (the dependency object).
  * [ ] Define the minimal interface (keep it small):

    * [ ] `requestRaw(doc: string, variables: unknown): Effect<unknown, GraphQLClientError>`
    * [ ] or directly `request<A>(doc: string, variables: unknown, schema: Schema.Schema<A>): Effect<A, GraphQLClientError>`
  * [ ] Implement `GraphQLClientLive(endpoint)` as a `Layer` using `fetch`:

    * [ ] POST JSON to `endpoint`
    * [ ] interpret HTTP status
    * [ ] parse JSON
    * [ ] treat GraphQL envelope as untrusted
    * [ ] optionally decode with schema (if you choose the “request+schema” API)

This matches the plan line items (“Tag … GraphQLClientLive(endpoint) Layer using fetch”).

**Discipline note (important for later phases):** this client lives in `core/` and must not import from `features/**`. The dependency arrows are one-way.

#### 5. Implement `UiRuntime` (bridge from Angular DI to Effect runtime)

* [ ] In `core/effect/ui-runtime.ts`:

  * [ ] Create an `AppLayer` (your chosen Layer composition), minimally:

    * [ ] `GraphQLClientLive("/graphql")` (or configurable later)
  * [ ] Create `ManagedRuntime.make(AppLayer)`
  * [ ] Expose exactly one “runner” method shape and standardize on it:

    * [ ] either `runPromiseExit(effect)`
    * [ ] or `runPromiseEither(effect)`
    * [ ] or `runFork(effect)` for fire-and-forget
  * [ ] Ensure runtime is disposed with the Angular lifecycle (e.g. `DestroyRef`).

This is precisely required by the plan (“ManagedRuntime.make(AppLayer) … method returning Exit or Either”).

#### 6. Add a toy store to prove the boundary

Create a minimal “feature” (not `core/`) whose *only job* is to prove “only stores run Effects”.

* [ ] Create folder: `apps/frontend/src/app/features/toy/`
* [ ] Create `toy.store.ts` (injectable):

  * [ ] has `state: WritableSignal<RemoteData<never, number>> = signal(RemoteData.initial())`
  * [ ] has a command method `run()` that:

    * [ ] sets `Loading`
    * [ ] runs `Effect.succeed(123)` **through `UiRuntime`**
    * [ ] writes `Success(123)` into the signal
* [ ] Absolutely no `Effect.runPromise` in the component; no `fetch` in the component; no `Layer` in the component.

This is the plan’s “tiny store with signal(RemoteData.initial()) … run trivial Effect … writes Success into a signal”.

#### 7. Add a toy page component that renders store state

* [ ] Create `toy.page.ts` as a **standalone component**, `OnPush`.
* [ ] Template shows:

  * [ ] initial/loading/success states
  * [ ] a button that calls `store.run()`
* [ ] Route it as the root route (temporary):

  * [ ] `apps/frontend/src/app/app.routes.ts`: route `""` → `ToyPage`

#### 8. Phase 2 verification (proof obligations)

* [ ] Start backend (whatever your backend command is).
* [ ] Start Angular (`pnpm -C apps/frontend start`).
* [ ] Visit `/`.
* [ ] Click the button.
* [ ] Observe: UI transitions `Initial → Loading → Success(123)` **without Zone.js** and without manual change detection.

This is exactly the verification requirement in the plan.

#### 9. Phase 2 exit criteria

* [ ] It is *physically true in code* that only stores run Effects (via `UiRuntime`).

---

## Micro-justification of why this Phase 1/2 structure is “best” for your preferences

* `core/**` is the **initial object** for infrastructure concerns: small, stable, dependency-light. Everything may depend on it; it depends on nothing “above”.
* `features/**` are algebras over `core/**`: they *interpret* core services into user-facing state (`Signals`) and commands.
* Components are **pure renderers** (functors from the poset/category of Signals into a DOM presentation), with no hidden effectful morphisms.

This factorization is exactly what prevents the “rat’s nest”: it forces a **thin waist** (the store boundary + `UiRuntime`) and keeps Angular’s reactivity as a controlled propagation graph rather than an ambient side-effect system.

---

If you want, in the next message I can also provide a **minimal diff-set** for Phase 1 (files + exact edits) and Phase 2 (exact file contents) that is small enough to apply mechanically—but the checklists above should already be precise enough to execute without inventing additional abstractions.
