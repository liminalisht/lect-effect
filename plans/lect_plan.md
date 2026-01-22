Here’s the shape I see in your current assembly, and a way to *reify* “lect” so that **(i)** selecting a lect determines the *sub-schema* you stand up, and **(ii)** the *service/config obligations* are the join of the obligations of the chosen modules—without rewriting handlers or duplicating schemas.

## What you already have, categorically

* Each handler is an arrow in a **Kleisli category** for `Effect`, with an explicit *environment* (service requirements) in its type, e.g. `helloHandler : NameInput → Effect<HelloResponse, _, GreetService>`, and item/product handlers similarly requiring repos, etc.
* Each GraphQL resolver is (morally) a natural transformation
  [
  \mathrm{Effect}(-, -, R);\Rightarrow;\mathrm{Promise}(-)
  ]
  implemented by `runEffect`, using the runtime carried in `GraphQLContext`.
* Your schema is the **colimit** (in practice, a `weave`) of the chosen resolver objects. Right now you always take the “big coproduct” of all resolvers (`makeResolvers()` is constant).
* Your layer graph is also a coproduct-ish composition: `appLayer = mergeAll(config+logger, greeting, db, repos)`—so today you always force *all* services and therefore *all* config reads, regardless of which operations appear in the schema.

So the missing abstraction is: **a lect is a chosen finite subfamily of “modules”, and everything else is induced functorially** (schema, runtime requirements, config obligations).

## Reify “lect” as a small manifest (modules + closure)

Define a *module* as a record that packages exactly what must “come along”:

* the resolvers it contributes (i.e. generators for your schema),
* the layer fragment that provides the services those resolvers’ handlers demand,
* a *declarative* list of config keys it needs (so you can decide what to read), and optionally a list of service tags for documentation/validation.

Conceptually:

* Let **Mods** be a discrete category of modules.
* Let **Svc** be the thin category (poset) of service-bundles ordered by inclusion.
* Each module is a morphism into products:
  [
  m \mapsto (\mathrm{Resolvers}(m),;\mathrm{Layer}(m),;\mathrm{CfgKeys}(m),;\mathrm{Req}(m)\in \mathbf{Svc})
  ]
* A **lect** is then a finite family (L \subset \mathrm{Mods}), and you define

  * `Resolvers(L) = ⋃_{m∈L} Resolvers(m)` (coproduct/union),
  * `Req(L) = ⋁_{m∈L} Req(m)` (join in the service poset),
  * `CfgKeys(L) = ⋃_{m∈L} CfgKeys(m)`,
  * `Layer(L) = ⊗_{m∈L} Layer(m)` (your `Layer.mergeAll`, i.e. monoidal product of providers).

This is precisely the “requirements come along with behavior” story you want, but made *first-class*.

## Minimal-code plan that respects your current architecture

### Step 1 — Make schema assembly *parametric*

Right now `makeSchema()` closes over `makeResolvers()` and therefore over the whole world. Change the direction:

* Instead of `makeSchema(): GraphQLSchema`, make it `makeSchema(resolvers: ReadonlyArray<...>): GraphQLSchema`.
* Keep all existing resolver definitions unchanged; you’re only changing *how you aggregate* them.

This is a tiny refactor: your resolver modules already export the components you need (`helloQueryMap`, `itemQueryMap`, field resolvers, mutations, etc.).

### Step 2 — Define “GraphqlModule” manifests (hello, masterdata, etc.)

Create a new folder, e.g. `src/lect/modules/`, and define modules like:

* **core**: “server necessities” (port/logging), i.e. the layer that must exist for *any* lect to start listening. Today that’s entangled in `ConfigService` + `loggerLayer` + app bootstrap.
* **hello**: hello query resolvers + `greetingLayer`.
* **masterdata**: product/item queries, mutations, field resolvers + `masterdataDbLayer` + repos layers.

The key: you *do not* touch handlers, domain schemas, or repo implementations; you only package existing exports into manifest objects.

### Step 3 — Define a lect registry and select it from config

Add something like `BACKEND_LECT` with a `Schema.Literal(...ids...)`. Then:

* `loadLectId` reads/validates the lect id.
* `lect = registry[lectId]`.
* `schema = makeSchema(lect.resolvers)`.
* `yoga = makeYoga(schema)` (unchanged in spirit).
* `main = appForLect(lect).pipe(Effect.provide(lect.layer))`.

This is the runtime “pullback along configuration”: a constant in config picks a fiber (a specific API + obligations).

### Step 4 — Make config *modular enough* to avoid reading unused keys

Right now `configLayer` eagerly reads both app settings and `MASTERDATA_*` settings even if the schema doesn’t expose masterdata operations.

To keep code small, do **one** of these (in increasing purity):

1. **Lazy masterdata config inside the DB layer** (smallest change):
   Keep `ConfigService` but change its `masterdataPg` field from a *value* to an *effectful thunk* (or function) so it’s only evaluated when `masterdataDbLayer` is actually built. Then a hello-only lect never constructs `masterdataDbLayer`, hence never reads those env vars.

2. **Split config tags** (cleaner, still modest):
   `AppConfigService` reads `BACKEND_*`.
   `MasterdataDbConfigService` reads `MASTERDATA_*`.
   `masterdataDbLayer` depends on `MasterdataDbConfigService` instead of the monolithic `ConfigService`.
   This makes `CfgKeys(L)` literally trackable per module.

Either way, you get: *selected lect ⇒ selected layers ⇒ selected config reads*.

### Step 5 — (Optional) Validate obligations at startup

Since the manifest contains `requiredServices` and `configKeys`, you can log (or even hard-fail) with a crisp “this lect requires X” message *before* starting Yoga. This is the operational payoff: lect becomes an explicit contract.

## Why this achieves “write once, assemble by lect”

* Domain schemas remain canonical objects; resolvers refer to them, but the *lect* determines which ones appear in the generated GraphQL schema (reachable via chosen resolvers).
* Handlers remain the unique implementation of domain behavior, and their `Effect` environment already expresses their service needs—your module manifests simply transport that obligation into layer composition.
* Layers remain the unique wiring of services; lect selection just chooses a subdiagram of your layer graph and takes its colimit (`mergeAll`).

If you want the most “topos-y” slogan: a lect is a *site choice* that determines which “covers” (modules) you allow, and the resulting API is the sheaf (assembled schema + runtime) induced by that site.

If you want, I can sketch a concrete *module/lect manifest shape* that matches your current folder structure (hello vs product/item) while keeping the code footprint to a couple new files plus a small refactor of `makeSchema` + `app.ts`.
