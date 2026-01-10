According to a document from your current repo and the old repo, the “shape” of the problem is:

* **Old `lect`**: *explicit* env parsing with **zod**, *explicit* resource caching for DB pools (module‑level `let _pool`), and *explicit* decoding of DB rows with zod (plus error translation).
* **New `lect-effect`**: env/config and services already live in the **Effect** world (e.g. `ConfigService` via `Effect.Config` + `Config.validate`, and then `Layer.mergeAll(...)` to form an app environment).

What you want is to make DB access an *honest morphism* in the “category of environments”: a `Layer` from upstream requirements (config, logging) to downstream capabilities (DB client services), with acquisition/release handled by scopes—not by handlers.

Below are the high-level library decisions + a concrete “one query” sketch for each database.

---

## Postgres: use `@effect/sql` + `@effect/sql-pg` (optionally + `@effect/sql-drizzle` or `@effect/sql-kysely`)

### Why this is the right default in an Effect codebase

1. **It is the Effect-native relational stack**: `@effect/sql` defines the core `SqlClient` abstraction and schema-driven validation utilities; DB-specific packages implement it (Postgres, MySQL, SQLite, MSSQL, …). ([DeepWiki][1])
2. **The query constructor is a tagged template with automatic parameter binding** (so the default ergonomics push you away from string-concatenation SQL). ([DeepWiki][2])
3. **Layering is first-class**: `PgClient.layer` / `PgClient.layerConfig` directly give you a `Layer` providing `PgClient | SqlClient`.
4. **Schema validation is built-in as a combinator**: `SqlSchema.findAll/findOne/single` run a query with a *request schema* and a *result schema*, producing parse errors if reality diverges from types.

This is essentially the same safety story you built manually in the old repo (zod env parsing + slonik pool + zod row parsing)—but internalized into the Effect algebra.

### “One query working” shape (Postgres)

Below is a minimal, idiomatic structure that matches your current `ConfigService` pattern and produces a `SqlClient` from a scoped pool layer.

#### 1) Extend config (Effect reads env vars; config is a Service)

```ts
// src/services/config.ts
import { Config, Effect, Layer, Redacted, Schema } from "effect"
import { ConfigService } from "./configServiceTag" // however you define your Tag today

const PgUrlSchema = Schema.NonEmptyString // you can tighten (URL) later

export type AppConfig = {
  readonly port: number
  readonly logLevel: "Debug" | "Info" | "Warning" | "Error"
  readonly pg: {
    readonly url: Redacted.Redacted
  }
}

export const configLayer = Layer.effect(
  ConfigService,
  Effect.gen(function* () {
    const port = yield* Config.withDefault(Config.integer("PORT"), 3000)
    const logLevel = yield* Config.withDefault(Config.string("LOG_LEVEL"), "Info")

    const pgUrl = yield* Config.redacted("PG_URL").pipe(
      // validate the *unredacted* string; store as Redacted
      Config.map(Redacted.value),
      Config.validate(PgUrlSchema),
      Config.map(Redacted.make)
    )

    return { port, logLevel, pg: { url: pgUrl } } satisfies AppConfig
  })
)
```

*(This is directly in line with what you’re already doing for `port` and `logLevel`.)*

#### 2) Postgres client Layer (pool acquired once, released with Scope)

```ts
// src/db/pg/layer.ts
import { Effect, Layer } from "effect"
import { PgClient } from "@effect/sql-pg"
import { ConfigService } from "../services/configServiceTag"

export const PgLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* ConfigService
    // PgClient.layer provides PgClient | SqlClient as services
    return PgClient.layer({ url: config.pg.url })
  })
)
```

`PgClient.layer` is exactly the “pool at provisioning time” story: a `Layer` that provides `PgClient | SqlClient`.

#### 3) A single query with request/result Schemas (max safety)

```ts
// src/db/pg/queries/findPersonById.ts
import { Effect, Option, Schema } from "effect"
import { SqlClient, SqlSchema } from "@effect/sql"

const PersonId = Schema.Number.pipe(Schema.int(), Schema.positive())
const Person = Schema.Struct({ id: PersonId, name: Schema.NonEmptyString })

export const findPersonById = SqlSchema.findOne({
  Request: Schema.Struct({ id: PersonId }),
  Result: Person,
  execute: ({ id }) =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient
      // Ask SqlClient for unknown rows; let SqlSchema decode them.
      return yield* sql<unknown>`
        SELECT id, name
        FROM people
        WHERE id = ${id}
      `
    })
})
```

The key point: `SqlSchema.findOne` *forces* both input validation (request schema) and output validation (result schema).

### Optional: Drizzle/Kysely on top

If you want more compile-time query typing (beyond Schema decoding), Effect also has official integrations like `@effect/sql-drizzle` and `@effect/sql-kysely` (still fed by the same `SqlClient`/pool).

---

## Oracle: use the official `oracledb` (node-oracledb) driver, wrapped in an Effect `Layer` + Schema decoding via `SqlSchema`

### Why this is the pragmatic choice

* There is **no first-party `@effect/sql-oracle` adapter** in the current adapter set (Postgres/MySQL/MSSQL/SQLite/etc.), so you won’t get a native `OracleClient.layerConfig` the way you do for Postgres. ([DeepWiki][1])
* The official ecosystem standard for Oracle in Node is **node-oracledb** (`oracledb` on npm).
* It supports **connection pooling** (`createPool`, `pool.close`) and recommends explicitly closing the pool when done.
* It supports **bind variables** (colon-prefixed placeholders) as the secure way to pass values into SQL/PLSQL.

So: treat “Oracle access” as its own Service in your environment, provided by a scoped Layer.

### “One query working” shape (Oracle)

#### 1) Add Oracle config to `ConfigService`

```ts
// extending AppConfig (conceptually)
readonly oracle: {
  readonly user: string
  readonly password: Redacted.Redacted
  readonly connectString: string
  readonly poolMin: number
  readonly poolMax: number
}
```

(Use `Config.string`, `Config.redacted`, defaults, and `Config.validate` exactly like you already do for port/logLevel.)

#### 2) Define an Oracle Service + Live Layer

```ts
// src/db/oracle/OracleClient.ts
import { Context, Data, Effect, Layer, Redacted } from "effect"
import oracledb from "oracledb"
import { ConfigService } from "../services/configServiceTag"

export class OracleError extends Data.TaggedError("OracleError")<{
  readonly cause: unknown
}> {}

export interface OracleClient {
  readonly execute: (
    statement: string,
    binds: Record<string, unknown>
  ) => Effect.Effect<ReadonlyArray<unknown>, OracleError>
}

export class OracleClient extends Context.Tag("OracleClient")<
  OracleClient,
  OracleClient
>() {}

export const OracleLive = Layer.scoped(
  OracleClient,
  Effect.gen(function* () {
    const cfg = yield* ConfigService

    const pool = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () =>
          oracledb.createPool({
            user: cfg.oracle.user,
            password: Redacted.value(cfg.oracle.password),
            connectString: cfg.oracle.connectString,
            poolMin: cfg.oracle.poolMin,
            poolMax: cfg.oracle.poolMax
          }),
        catch: (cause) => new OracleError({ cause })
      }),
      (p) =>
        Effect.tryPromise({
          try: () => p.close(0), // close pool
          catch: (cause) => new OracleError({ cause })
        }).ignore
    )

    const execute: OracleClient["execute"] = (statement, binds) =>
      Effect.acquireUseRelease(
        Effect.tryPromise({
          try: () => pool.getConnection(),
          catch: (cause) => new OracleError({ cause })
        }),
        (conn) =>
          Effect.tryPromise({
            try: async () => {
              const result = await conn.execute(statement, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT
              })
              return (result.rows ?? []) as ReadonlyArray<unknown>
            },
            catch: (cause) => new OracleError({ cause })
          }),
        (conn) =>
          Effect.tryPromise({
            try: () => conn.close(),
            catch: (cause) => new OracleError({ cause })
          }).ignore
      )

    return { execute } satisfies OracleClient
  })
)
```

This matches node-oracledb’s documented pooling lifecycle (`close()` when finished).
And it enforces bind-parameter usage (you’ll write SQL with `:id` etc).

#### 3) One query + Schema validation (reusing `SqlSchema`)

Even though you’re not using `@effect/sql` for Oracle *transport*, you can still use `SqlSchema` as the **Schema-mediated interpreter**: you provide `execute: (req) => Effect<ReadonlyArray<unknown>>`, and it validates/decodes.

```ts
// src/db/oracle/queries/findPersonById.ts
import { Effect, Schema } from "effect"
import { SqlSchema } from "@effect/sql"
import { OracleClient } from "../OracleClient"

const PersonId = Schema.Number.pipe(Schema.int(), Schema.positive())
const Person = Schema.Struct({ id: PersonId, name: Schema.NonEmptyString })

export const findPersonById = SqlSchema.findOne({
  Request: Schema.Struct({ id: PersonId }),
  Result: Person,
  execute: ({ id }) =>
    Effect.gen(function* () {
      const oracle = yield* OracleClient
      return yield* oracle.execute(
        `SELECT id, name FROM people WHERE id = :id`,
        { id }
      )
    })
})
```

`SqlSchema.findOne` guarantees the request/result decoding contract.

---

## How this improves over the old `slonik + zod` architecture

In the old repo you had:

* imperative caching (`let _pool`), separate per DB,
* ad-hoc row decoding and error translation patterns around each query.

In the new architecture:

* The pool is **a scoped resource** supplied by a `Layer` (so it composes, it’s testable, and lifecycle is explicit),
* The “decode boundary” is **a reusable combinator** (`SqlSchema.*`) rather than repeated boilerplate,
* Your handlers/resolvers now depend on *domain services* (repositories) rather than “how to connect”.

This gives you a clean “factorization”:

> **Resolvers/handlers** ≅ morphisms that require a *small* environment (domain services),
> **Live DB implementations** ≅ a choice of `Layer`s interpreting those services,
> **Tests** ≅ alternate `Layer`s providing the same service objects (mock/in-memory).

---

## Where to put things (a repo layout that scales)

A structure that scales with more services and more DBs is:

* `src/domain/…` — Schemas + branded IDs + pure domain functions (no Effects)
* `src/services/…` — service *interfaces* (`Context.Tag`), errors
* `src/infra/config/…` — `ConfigService` live layer
* `src/infra/db/pg/…` — `PgLive` + PG implementations of repos
* `src/infra/db/oracle/…` — `OracleLive` + Oracle implementations of repos
* `src/graphql/…` — schema/resolvers that call handlers (which call services)

This mirrors what your new code has started (services + layers), but avoids letting “DB-ness” leak into domain/GraphQL.

---

## Direct answers to your concrete DB questions

### “What libraries should we use for Postgres?”

**Use `@effect/sql` + `@effect/sql-pg`** as the primary integration. It gives:

* Effect-native pool lifecycle via `PgClient.layer` / `layerConfig`
* tagged-template queries with parameter binding ([DeepWiki][2])
* schema-driven request/result validation via `SqlSchema`

If you want a query builder/ORM feel, add `@effect/sql-drizzle` or `@effect/sql-kysely` later, but keep the same `SqlClient` substrate.

### “What libraries should we use for Oracle?”

**Use `oracledb` (node-oracledb)** and wrap it in an Effect `Layer.scoped` that owns a pool.
Then use **bind variables** (`:id`, etc.) for safety.
You can still get strong runtime safety by decoding outputs with `SqlSchema` + Effect `Schema`.

### “Connections should not be established in handlers, right?”

Correct. In Effect terms: *handlers should be morphisms in the Kleisli category of `Effect` whose environment contains a DB service; acquisition belongs in the Layer, not in the handler*.

---

If you want, I can next sketch how to plug these layers into your existing `appLayer` (you already have `Layer.mergeAll(configLayer, greetingLayer, loggerLayer)`) so that:

* Postgres and Oracle layers depend on `ConfigService`,
* repo layers depend on `SqlClient` or `OracleClient`,
* GraphQL handlers depend only on repo services,
  and then show what a “mock repo layer” looks like for tests.

[1]: https://deepwiki.com/Effect-TS/effect/6.2-database-adapters-and-drivers?utm_source=chatgpt.com "Database Adapters and Drivers | Effect-TS/effect | DeepWiki"
[2]: https://deepwiki.com/Effect-TS/effect/6.1-sql-core-and-query-building?utm_source=chatgpt.com "SQL Core and Query Building | Effect-TS/effect | DeepWiki"

-----

### Library choices (new `lect-effect` vs old `lect`)

In the old codebase you were doing three separable things:

1. **Read + validate env**, cache it (Zod)
2. **Construct and cache pools** (Slonik `createPool`)
3. **Validate query IO** (Slonik `sql.type(zodSchema)` plus `parseDbRow`)

In `lect-effect`, those three concerns should become *objects and morphisms in the “category of contexts”*:

* **Services** are objects (interfaces / algebras).
* **Layers** are morphisms ( R \to S ) that construct services from dependencies (and manage resource lifetime).
* **Handlers** are morphisms in `Effect` that consume services.

#### Postgres (recommended)

Use **`@effect/sql` + `@effect/sql-pg`**.

Why:

* It gives you a pooled client as a **Layer**, so acquisition/release is scoped and not “hidden global cache” like the Slonik pattern.
* The client is a *tagged-template constructor* (so it preserves the ergonomics you had with Slonik), and statements are already `Effect`s (so no impedance mismatch)
* `@effect/sql-pg`’s `PgClient.layer(...)` is the canonical Layer for Postgres

#### Oracle (recommended)

There is **no first-party Oracle adapter in `@effect/sql-*`** (adapters are listed for pg/mysql/sqlite/etc., but not Oracle) .
So the pragmatic choice is:

* Use **`oracledb` (node-oracledb)** as the driver
* Wrap a pool in a **scoped Layer**
* Expose a small **OracleClient service** (your own algebra)
* Decode inputs/outputs with **`Schema`** at the boundary

(You can later factor that OracleClient into a `@effect/sql`-style adapter, but that’s a separate project.)

`oracledb.createPool(...)` and pool lifecycle (`close`) are the right primitives to wrap .

---

## Architectural target in `lect-effect`

You already moved in the right direction: GraphQL holds a `Runtime<AppServices>` in context and `runEffect` is your natural transformation
[
\texttt{Effect<A,E,R>} \Rightarrow \texttt{Promise<A>}
]
by interpreting effects in that runtime.

Likewise, you already have:

* `ConfigService` and a `configLayer` built from `Effect.Config`
* `loggerLayer` depending on config
* `appLayer = mergeAll(config, logger∘config, greeting)`
* `makeYoga(schema)` that injects the runtime into Yoga context

So: **extend the same pattern to DB pools and DB-backed services**.

---

# End-to-end sketch: Config → Layers → Services → Handler → GraphQL

Below is a concrete “single query per DB” implementation that you can drop in, then scale into real repositories.

## 0) New env vars

Example:

```bash
# existing
PORT=4000
LOGLEVEL=Info

# postgres
PG_URL=postgres://user:pass@localhost:5432/app
PG_MAX_CONNECTIONS=10

# oracle
ORACLE_USER=...
ORACLE_PASSWORD=...
ORACLE_CONNECT_STRING=host:1521/service
ORACLE_POOL_MIN=0
ORACLE_POOL_MAX=4
ORACLE_POOL_INCREMENT=1
```

(You can rename to match your deployment conventions; the structure stays.)

---

## 1) `src/services/config.ts`

Your current shape is `{ port, logLevel }`. Extend it:

```ts
import { Context, type LogLevel, Redacted } from "effect"
import type { Port } from "../domain/port"

export type PostgresConfig = {
  readonly url: Redacted.Redacted
  readonly maxConnections: number
}

export type OracleConfig = {
  readonly user: string
  readonly password: Redacted.Redacted
  readonly connectString: string
  readonly poolMin: number
  readonly poolMax: number
  readonly poolIncrement: number
}

export type AppConfig = {
  readonly port: Port
  readonly logLevel: LogLevel.LogLevel
  readonly postgres: PostgresConfig
  readonly oracle: OracleConfig
}

export class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  AppConfig
>() {}
```

**Note**: using `Redacted` for secrets means “log config freely” doesn’t leak credentials (it prints `<redacted>`).

---

## 2) `src/layers/config.ts`

Pattern-match your existing config layer (port+loglevel) and add DB fields:

```ts
import { Config, Effect, Layer } from "effect"
import { portSchema } from "../domain/port"
import { ConfigService } from "../services/config"

export const configLayer: Layer.Layer<ConfigService, Config.ConfigError> =
  Layer.effect(
    ConfigService,
    Effect.gen(function* () {
      const portNumber = yield* Config.number("PORT").pipe(Config.withDefault(4000))
      const port = yield* portSchema.make(portNumber)

      const logLevel = yield* Config.logLevel("LOGLEVEL").pipe(
        Config.withDefault("Info")
      )

      // Postgres
      const pgUrl = yield* Config.redacted("PG_URL")
      const pgMaxConnections = yield* Config.number("PG_MAX_CONNECTIONS").pipe(
        Config.withDefault(10)
      )

      // Oracle
      const oracleUser = yield* Config.string("ORACLE_USER")
      const oraclePassword = yield* Config.redacted("ORACLE_PASSWORD")
      const oracleConnectString = yield* Config.string("ORACLE_CONNECT_STRING")
      const oraclePoolMin = yield* Config.number("ORACLE_POOL_MIN").pipe(Config.withDefault(0))
      const oraclePoolMax = yield* Config.number("ORACLE_POOL_MAX").pipe(Config.withDefault(4))
      const oraclePoolIncrement = yield* Config.number("ORACLE_POOL_INCREMENT").pipe(
        Config.withDefault(1)
      )

      return {
        port,
        logLevel,
        postgres: { url: pgUrl, maxConnections: pgMaxConnections },
        oracle: {
          user: oracleUser,
          password: oraclePassword,
          connectString: oracleConnectString,
          poolMin: oraclePoolMin,
          poolMax: oraclePoolMax,
          poolIncrement: oraclePoolIncrement,
        },
      }
    })
  )
```

---

## 3) Postgres: layer + one query service

### 3a) `src/services/postgresPing.ts`

```ts
import { Context, Effect } from "effect"

export class PostgresPingService extends Context.Tag("PostgresPingService")<
  PostgresPingService,
  {
    readonly ping: () => Effect.Effect<boolean, unknown>
  }
>() {}
```

(We’ll tighten the error type in a moment; keeping `unknown` while you iterate is fine.)

### 3b) `src/layers/postgres.ts`

This uses `@effect/sql-pg` to create a pooled SQL client as a Layer , then builds a small service that *closes over* that client.

```ts
import { Effect, Layer, Schema } from "effect"
import { PgClient } from "@effect/sql-pg"
import { SqlClient } from "@effect/sql"
import { ConfigService } from "../services/config"
import { PostgresPingService } from "../services/postgresPing"

// runtime validation of row-shape
const pgPingRowSchema = Schema.Struct({ ok: Schema.Boolean })
type PgPingRow = Schema.Schema.Type<typeof pgPingRowSchema>
const decodePgPingRow = Schema.decodeUnknown(pgPingRowSchema)

// Provides PgClient + SqlClient, constructed from ConfigService
const pgClientLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { postgres } = yield* ConfigService
    return PgClient.layer({
      url: postgres.url,
      maxConnections: postgres.maxConnections,
    })
  })
)

// Provides PostgresPingService, requires SqlClient
const postgresPingLayer0 = Layer.effect(
  PostgresPingService,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    // `sql` is a tagged-template “Constructor”, and statements are Effects

    return PostgresPingService.of({
      ping: () =>
        Effect.gen(function* () {
          const rows = yield* sql<unknown>`SELECT TRUE AS "ok"`
          const row = rows[0]
          if (!row) return yield* Effect.fail(new Error("pg ping returned 0 rows"))
          const decoded: PgPingRow = yield* decodePgPingRow(row)
          return decoded.ok
        }),
    })
  })
)

// Final exported layer: requires ConfigService, provides PostgresPingService
export const postgresPingLayer = postgresPingLayer0.pipe(Layer.provide(pgClientLayer))
```

**Key point**: the pool is established in the **Layer**, not in the handler. The handler only sees `PostgresPingService`.

---

## 4) Oracle: layer + one query service

### 4a) `src/services/oracleClient.ts`

```ts
import { Context, Effect } from "effect"

// keep the “driver algebra” small; grow as needed
export class OracleClient extends Context.Tag("OracleClient")<
  OracleClient,
  {
    readonly execute: (
      sql: string,
      binds?: Record<string, unknown>
    ) => Effect.Effect<ReadonlyArray<Record<string, unknown>>, unknown>
  }
>() {}
```

### 4b) `src/services/oraclePing.ts`

```ts
import { Context, Effect } from "effect"

export class OraclePingService extends Context.Tag("OraclePingService")<
  OraclePingService,
  {
    readonly ping: () => Effect.Effect<boolean, unknown>
  }
>() {}
```

### 4c) `src/layers/oracle.ts`

Wrap `oracledb.createPool` / `pool.close` in `Layer.scoped` :

```ts
import oracledb from "oracledb"
import { Effect, Layer, Redacted, Schema } from "effect"
import { ConfigService } from "../services/config"
import { OracleClient } from "../services/oracleClient"
import { OraclePingService } from "../services/oraclePing"

// decode the row we expect; Oracle needs numeric -> boolean mapping
const oraclePingRowSchema = Schema.Struct({ ok: Schema.Number })
type OraclePingRow = Schema.Schema.Type<typeof oraclePingRowSchema>
const decodeOraclePingRow = Schema.decodeUnknown(oraclePingRowSchema)

export const oracleClientLayer: Layer.Layer<OracleClient, unknown, ConfigService> =
  Layer.scoped(
    OracleClient,
    Effect.gen(function* () {
      const { oracle } = yield* ConfigService

      const pool = yield* Effect.acquireRelease(
        Effect.tryPromise(() =>
          oracledb.createPool({
            user: oracle.user,
            password: Redacted.value(oracle.password),
            connectString: oracle.connectString,
            poolMin: oracle.poolMin,
            poolMax: oracle.poolMax,
            poolIncrement: oracle.poolIncrement,
          })
        ),
        (pool) =>
          // close on scope exit
          Effect.tryPromise(() => pool.close()).orDie
      )

      return OracleClient.of({
        execute: (statement, binds = {}) =>
          Effect.acquireUseRelease(
            Effect.tryPromise(() => pool.getConnection()),
            (conn) =>
              Effect.tryPromise(async () => {
                const result = await conn.execute(statement, binds, {
                  outFormat: oracledb.OUT_FORMAT_OBJECT,
                })
                return (result.rows ?? []) as ReadonlyArray<Record<string, unknown>>
              }),
            (conn) => Effect.tryPromise(() => conn.close()).orDie
          ),
      })
    })
  )

export const oraclePingLayer: Layer.Layer<OraclePingService, unknown, ConfigService> =
  Layer.effect(
    OraclePingService,
    Effect.gen(function* () {
      const client = yield* OracleClient
      return OraclePingService.of({
        ping: () =>
          Effect.gen(function* () {
            // quote alias to preserve lowercase key in OUT_FORMAT_OBJECT result
            const rows = yield* client.execute(`SELECT 1 AS "ok" FROM dual`)
            const row = rows[0]
            if (!row) return yield* Effect.fail(new Error("oracle ping returned 0 rows"))
            const decoded: OraclePingRow = yield* decodeOraclePingRow(row)
            return decoded.ok === 1
          }),
      })
    })
  ).pipe(Layer.provide(oracleClientLayer))
```

Again: pool lifetime is managed by the Layer; per-query connection is bracketed.

---

## 5) `src/services/index.ts` (AppServices)

Right now:

```ts
export type AppServices = ConfigService | GreetingService
```

…as in your code. Extend:

```ts
import type { ConfigService } from "./config"
import type { GreetingService } from "./greeting"
import type { PostgresPingService } from "./postgresPing"
import type { OraclePingService } from "./oraclePing"

export type AppServices =
  | ConfigService
  | GreetingService
  | PostgresPingService
  | OraclePingService
```

Now `Runtime<AppServices>` in GraphQL context continues to work unchanged.

---

## 6) `src/layers/app.ts` (compose the diagram)

Your current `appLayer` is `mergeAll(config, logger∘config, greeting)`. Extend it:

```ts
import { Layer } from "effect"
import { configLayer } from "./config"
import { loggerLayer } from "./logger"
import { greetingLayer } from "./greeting"
import { postgresPingLayer } from "./postgres"
import { oraclePingLayer } from "./oracle"

export const appLayer = Layer.mergeAll(
  configLayer,
  loggerLayer.pipe(Layer.provide(configLayer)),
  greetingLayer,

  // DB-backed services (each depends on ConfigService, satisfied by configLayer above)
  postgresPingLayer.pipe(Layer.provide(configLayer)),
  oraclePingLayer.pipe(Layer.provide(configLayer))
)
```

This keeps dependencies explicit (each DB service layer clearly factors through `ConfigService`).

---

## 7) Add one handler + GraphQL query (optional but “end-to-end”)

### 7a) `src/domain/dbHealth.ts`

```ts
import { Schema } from "effect"

export const dbHealthSchema = Schema.Struct({
  postgresOk: Schema.Boolean,
  oracleOk: Schema.Boolean,
})

export type DbHealth = Schema.Schema.Type<typeof dbHealthSchema>
```

### 7b) `src/handlers/dbHealth.ts`

```ts
import { Effect } from "effect"
import { PostgresPingService } from "../services/postgresPing"
import { OraclePingService } from "../services/oraclePing"
import type { DbHealth } from "../domain/dbHealth"

export const dbHealthHandler: Effect.Effect<
  DbHealth,
  unknown,
  PostgresPingService | OraclePingService
> = Effect.gen(function* () {
  const pg = yield* PostgresPingService
  const ora = yield* OraclePingService

  const [postgresOk, oracleOk] = yield* Effect.all([pg.ping(), ora.ping()], {
    concurrency: "unbounded",
  })

  return { postgresOk, oracleOk }
})
```

### 7c) `src/graphql/resolvers/health.ts`

This follows your existing resolver style (using `Schema.standardSchemaV1` + `runEffect`):

```ts
import { resolver, query } from "@gqloom/core"
import { Schema } from "effect"
import { runEffect } from "../context"
import { dbHealthHandler } from "../../handlers/dbHealth"
import { dbHealthSchema } from "../../domain/dbHealth"

export const healthResolver = resolver({
  dbHealth: query(Schema.standardSchemaV1(dbHealthSchema)).resolve(() =>
    runEffect(dbHealthHandler)
  ),
})
```

### 7d) `src/graphql/resolvers/index.ts`

```ts
import { helloResolver } from "./hello"
import { healthResolver } from "./health"

export const makeResolvers = () => [helloResolver, healthResolver]
```

Now `dbHealth` executes **one Postgres query** and **one Oracle query**, with Schema-validated decoding.

---

# Notes on your specific concerns (DB edition)

### “Connections should not be established in handlers”

Correct. The *only* place that should allocate pools is:

* in a scoped `Layer` (your own, or `PgClient.layer(...)`)
* composed into `appLayer`, then interpreted into a `Runtime` (which you already do for GraphQL).

Handlers should only see service algebras.

### “How do we validate query IO with `Schema`?”

Two practical levels:

1. **Row-shape decode** (what I showed): `Schema.decodeUnknown(rowSchema)` per row.
   This is the direct analogue of `sql.type(zodSchema)` in Slonik.

2. **Request/response schemas** for “repository methods”:
   Give each query a *request schema* (inputs) and *row schema* (outputs), and decode both at the boundary. This scales especially well when you start generating fast-check arbitraries from schemas (which you’re already planning).

### “How will this look with many services / tests / mocking?”

This approach preserves the thing you’re already doing well in `lect-effect`:

* `Runtime<AppServices>` lives in GraphQL context
* tests can provide alternate layers (you already do that for config/logger/greeting)

For DB tests, you just add test layers:

```ts
import { Layer } from "effect"
import { PostgresPingService } from "../src/services/postgresPing"
import { OraclePingService } from "../src/services/oraclePing"

export const testDbLayer = Layer.mergeAll(
  Layer.succeed(PostgresPingService, PostgresPingService.of({ ping: () => Effect.succeed(true) })),
  Layer.succeed(OraclePingService, OraclePingService.of({ ping: () => Effect.succeed(true) })),
)
```

…and merge into your existing `testLayer` pattern.

---

# Summary decision table

* **Postgres**: `@effect/sql` + `@effect/sql-pg` (pool as Layer, queries as Effects via tagged template)
* **Oracle**: `oracledb` wrapped in a scoped Layer + your own `OracleClient` service; decode with `Schema`
* **Validation**: `Schema.decodeUnknown` at query boundaries (row schemas + request schemas), mirroring what Slonik+Zod gave you
* **Architecture**: pools live in layers, handlers see only algebras; `appLayer` is the explicit limit (merged cone) of your dependency diagram

If you want, I can also show the *next scaling step*: a “repository per database” pattern where **multiple query services share one Postgres pool layer** (so you don’t rebuild the `PgClient` layer per service), while still preventing `SqlClient` from leaking into the public `AppServices` surface.

----


You’re exactly right to worry here: **you want one pooled DB resource per database, and many higher-level services (repos, query algebras, etc.) to factor through that single pool**. Categorically:

* a DB pool layer is a morphism
  [
  \mathrm{ConfigService} \longrightarrow \mathrm{Db}
  ]
* each repository layer is a morphism
  [
  \mathrm{Db} \longrightarrow \mathrm{Repo}_i
  ]
* your “module layer” for a DB is the composite (and monoidal product over repos)
  [
  \mathrm{ConfigService} \longrightarrow (\mathrm{Repo}_1 \otimes \cdots \otimes \mathrm{Repo}_n)
  ]

The key engineering property you need is **Layer memoization / sharing**: if the same layer instance is used multiple times in the dependency graph, it is allocated once (memoized by reference equality), so your pool won’t be created multiple times. Effect’s docs are explicit about this and warn against “calling `f()` twice” to create two distinct layer instances.

Also: your current GraphQL wiring (runtime stored in `GraphQLContext`, `runEffect` reading it via `useContext`, and handlers requiring only the sub-union of `AppServices`) is already the right *shape* for scaling to many services.

Below is a concrete pattern that scales cleanly to **many services backed by the same Postgres pool**, while optionally hiding the raw SQL client from `AppServices`.

---

## Pattern A (recommended): “DB handle service” + many repo services

### Goal

* **One** Postgres pool layer (shared).
* Many repository services depend on a *single* `MasterdataDb` service (not directly on `SqlClient`).
* You can choose whether `MasterdataDb` is part of `AppServices` or is *hidden* (provided internally).

This mirrors your old `masterdatadb` module organization, but with Effect Layers and `Schema` decoding.

---

# 1) Config shape

Extend your existing `ConfigService` (you already have it and build it via `Config` in a layer)  with a nested Postgres config:

```ts
// src/services/config.ts
import { Context, LogLevel, Redacted } from 'effect';
import type { Port } from '../domain/port';

export type AppConfig = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;

  // one DB; add more if you have multiple Postgres instances
  readonly masterdataPg: {
    readonly url: Redacted.Redacted;
    readonly maxConnections: number;
  };
};

export class ConfigService extends Context.Tag('ConfigService')<
  ConfigService,
  AppConfig
>() {}
```

And in your config layer, add:

```ts
// src/layers/config.ts
import { Config, Effect, Layer, LogLevel } from 'effect';
import { ConfigService } from '../services/config';
import { portSchema } from '../domain/port';

export const configLayer = Layer.effect(
  ConfigService,
  Effect.gen(function* () {
    const portNumber = yield* Config.number('PORT').pipe(Config.withDefault(4000));
    const port = yield* portSchema.make(portNumber);

    const logLevel = yield* Config.logLevel('LOGLEVEL').pipe(Config.withDefault(LogLevel.Info));

    const url = yield* Config.redacted('PG_URL'); // e.g. postgres://...
    const maxConnections = yield* Config.number('PG_MAX_CONNECTIONS').pipe(Config.withDefault(10));

    return {
      port,
      logLevel,
      masterdataPg: { url, maxConnections },
    };
  }),
);
```

---

# 2) A single shared Postgres pool layer

## 2.1 DB-handle service

```ts
// src/services/masterdataDb.ts
import { Context } from 'effect';
import type { SqlClient } from '@effect/sql';

// This is your “one pool per DB” handle.
// Keep it narrow: expose `sql` (or even narrower, a `query` function).
export class MasterdataDb extends Context.Tag('MasterdataDb')<
  MasterdataDb,
  { readonly sql: SqlClient.SqlClient }
>() {}
```

## 2.2 Layer that allocates the pool once

This uses `@effect/sql-pg` to build the pool as a Layer, then wraps it in your own `MasterdataDb` service.

```ts
// src/layers/masterdataDb.ts
import { Effect, Layer } from 'effect';
import { PgClient } from '@effect/sql-pg';
import { SqlClient } from '@effect/sql';
import { ConfigService } from '../services/config';
import { MasterdataDb } from '../services/masterdataDb';

// IMPORTANT: define as a *value*, not a function, to preserve reference-equality memoization.
const masterdataSqlLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const cfg = yield* ConfigService;
    return PgClient.layer({
      url: cfg.masterdataPg.url,
      maxConnections: cfg.masterdataPg.maxConnections,
    });
  }),
);

// Wrap SqlClient into your own DB service so repos depend on MasterdataDb, not SqlClient.
export const masterdataDbLayer: Layer.Layer<MasterdataDb, unknown, ConfigService> =
  Layer.effect(
    MasterdataDb,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      return MasterdataDb.of({ sql });
    }),
  ).pipe(
    // Provide the pooled SqlClient to construct MasterdataDb
    Layer.provide(masterdataSqlLayer),
  );
```

### Why this shares the pool

* In the dependency graph, `masterdataSqlLayer` is a single layer value.
* If multiple services depend on `MasterdataDb` (and thus on this pool), **Effect memoizes by reference equality** and allocates it once.
* The main footgun is: don’t write `const masterdataSqlLayer = () => ...` and call it multiple times, because that produces multiple layer instances (no sharing).

---

# 3) Two repositories backed by that one pool

Here are two example repo services (“UserRepo” and “ProductRepo”) that share the same `MasterdataDb` pool.

## 3.1 Domain + row schemas (minimal)

```ts
// src/domain/user.ts
import { Schema } from 'effect';

export const userSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
}).annotations({ title: 'User' });

export type User = Schema.Schema.Type<typeof userSchema>;
```

```ts
// src/domain/product.ts
import { Schema } from 'effect';

export const productSchema = Schema.Struct({
  id: Schema.Number,
  sku: Schema.String,
  title: Schema.String,
}).annotations({ title: 'Product' });

export type Product = Schema.Schema.Type<typeof productSchema>;
```

## 3.2 Service interfaces

```ts
// src/services/userRepo.ts
import { Context, Effect, Option } from 'effect';
import type { User } from '../domain/user';

export class UserRepo extends Context.Tag('UserRepo')<
  UserRepo,
  {
    readonly byId: (id: number) => Effect.Effect<Option.Option<User>, unknown>;
  }
>() {}
```

```ts
// src/services/productRepo.ts
import { Context, Effect, Option } from 'effect';
import type { Product } from '../domain/product';

export class ProductRepo extends Context.Tag('ProductRepo')<
  ProductRepo,
  {
    readonly bySku: (sku: string) => Effect.Effect<Option.Option<Product>, unknown>;
  }
>() {}
```

## 3.3 Live layers (both depend on MasterdataDb)

```ts
// src/layers/userRepo.ts
import { Effect, Layer, Option, Schema } from 'effect';
import { UserRepo } from '../services/userRepo';
import { MasterdataDb } from '../services/masterdataDb';
import { userSchema } from '../domain/user';

const decodeUser = Schema.decodeUnknown(userSchema);

export const userRepoLayer: Layer.Layer<UserRepo, never, MasterdataDb> =
  Layer.effect(
    UserRepo,
    Effect.gen(function* () {
      const { sql } = yield* MasterdataDb;

      return UserRepo.of({
        byId: (id) =>
          Effect.gen(function* () {
            const rows = yield* sql<unknown>`
              SELECT id, name
              FROM app_user
              WHERE id = ${id}
            `;
            const row = rows[0];
            if (!row) return Option.none();
            const user = yield* decodeUser(row);
            return Option.some(user);
          }),
      });
    }),
  );
```

```ts
// src/layers/productRepo.ts
import { Effect, Layer, Option, Schema } from 'effect';
import { ProductRepo } from '../services/productRepo';
import { MasterdataDb } from '../services/masterdataDb';
import { productSchema } from '../domain/product';

const decodeProduct = Schema.decodeUnknown(productSchema);

export const productRepoLayer: Layer.Layer<ProductRepo, never, MasterdataDb> =
  Layer.effect(
    ProductRepo,
    Effect.gen(function* () {
      const { sql } = yield* MasterdataDb;

      return ProductRepo.of({
        bySku: (sku) =>
          Effect.gen(function* () {
            const rows = yield* sql<unknown>`
              SELECT id, sku, title
              FROM product
              WHERE sku = ${sku}
            `;
            const row = rows[0];
            if (!row) return Option.none();
            const product = yield* decodeProduct(row);
            return Option.some(product);
          }),
      });
    }),
  );
```

---

# 4) One “module layer” that wires DB → repos and hides the DB handle if you want

Now you can build a single layer that:

* allocates the pool once
* provides both repositories
* does **not** leak `MasterdataDb` into `AppServices` (because we use `Layer.provide`, not “merge outputs”).

```ts
// src/layers/masterdata.ts
import { Layer } from 'effect';
import { masterdataDbLayer } from './masterdataDb';
import { userRepoLayer } from './userRepo';
import { productRepoLayer } from './productRepo';

// Repos require MasterdataDb; we discharge that requirement here.
export const masterdataLayer =
  Layer.mergeAll(userRepoLayer, productRepoLayer).pipe(
    Layer.provide(masterdataDbLayer),
  );
```

**This is the scaling move**: you can add `N` repo layers and they all share the same pool, because the pool is upstream and memoized.

---

# 5) AppServices + appLayer wiring

Your current `GraphQLContext` carries `Runtime<AppServices>` and `runEffect` accepts `Effect<_,_,AppServices>`, which is exactly what makes this scale.

Update `AppServices`:

```ts
// src/services/index.ts
import type { ConfigService } from './config';
import type { GreetingService } from './greeting';
import type { UserRepo } from './userRepo';
import type { ProductRepo } from './productRepo';

export type AppServices =
  | ConfigService
  | GreetingService
  | UserRepo
  | ProductRepo;
```

Then extend your `appLayer` to include `masterdataLayer` (and keep your logger/config wiring as-is).

```ts
// src/layers/app.ts
import { Layer } from 'effect';
import type { AppError } from '../errors';
import type { AppServices } from '../services';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';
import { masterdataLayer } from './masterdata';

export const appLayer: Layer.Layer<AppServices, AppError> =
  Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
    greetingLayer,

    // brings in UserRepo + ProductRepo, backed by one shared Pg pool
    masterdataLayer.pipe(Layer.provide(configLayer)),
  );
```

Now:

* handlers can demand `UserRepo` without mentioning `MasterdataDb`
* resolvers still just `runEffect(handler(...))`
* adding more DB-backed services is “add a repo tag + layer, then merge into masterdataLayer, then add to AppServices union”.

---

## A crucial note about “where pooling happens”

Because you’re creating a single Effect runtime at server start and putting it into Yoga context (your current approach), you are **providing layers globally**, not locally per resolver. That’s exactly what you want: global provide ⇒ sharing/memoization.

If you ever provide a DB layer **locally** inside a resolver/effect, you can accidentally allocate multiple pools; the memoization story changes unless you use explicit memoization (`Layer.memoize`) or global provision.

---

## Testing payoff

With this structure you get clean “mocking surfaces”:

* unit test a handler: `Effect.provideService(UserRepo, fakeUserRepo)` (no DB needed)
* integration test repos: provide `masterdataDbLayer` pointing at a test DB
* GraphQL boundary tests: build a runtime from `appLayer` but override `UserRepo` / `ProductRepo` with test layers.

You won’t need to change `runEffect` or the GraphQL context design as you add services; you just grow `AppServices`.

---

## Next step (optional but likely): avoid N+1 with batching

Once you have many resolvers, you’ll run into GraphQL N+1 patterns. Effect has a principled `Request`/`RequestResolver` batching + caching mechanism you can embed *inside* repos (so resolvers remain pure). That’s the next “category-level” optimization after the layering is correct.

---

If you tell me the *actual* Postgres-backed service family you expect first (e.g. `ItemRepo`, `ProductRepo`, `WorkflowRepo` like in the old `lect` tree), I can rewrite the above example using your real names and show the exact folder/module layout that matches your intended domain separation.

----
Below is a concrete “Effect-native” end-to-end shape that (a) matches the **Item/Product/item_prod** data model from the old repo, (b) supports **many services backed by the same DB pool**, (c) makes **Layer dependencies explicit**, and (d) gives you a clean surface for **testing + mocking**.

I’ll do two parallel tracks:

1. **Postgres**: use `@effect/sql` + `@effect/sql-pg` (the Effect team’s SQL stack).
2. **Oracle**: there is no first‑party Oracle dialect in `@effect/sql`’s current dialect set, so wrap the official Oracle driver in an Effect `Layer.scoped` service.

This is compatible with your current “GraphQL context contains a runtime + `runEffect` turns `Effect` into `Promise`” approach, which is already a big improvement over the earlier manual threading (your current `GraphQLContext` and `runEffect` are now the right *shape*: runtime in context + `useContext()` inside `runEffect`).

---

## 0) Ground truth: Item/Product shapes and relationship

From the old repo, the masterdata DB record shapes are:

* `product`: `{ id: int, description: string | null }`【and operations select `id, description`】
* `item`: `{ id: int, description: string | null, pack_size: int }`
* `item_prod`: `{ item_id: int, product_id: int }` (linking product→items)

Your old domain schemas also keep the same field names (including `pack_size`) and add optional `__typename`.

So we’ll preserve exactly that *shape*, but reify it with **Effect Schema** and **services**.

---

## 1) Library decisions

### Postgres

**Use:** `@effect/sql` + `@effect/sql-pg`.

Why this is the “most Effect” option:

* `@effect/sql-pg` gives you a `Layer` that builds a Postgres client from a typed config (`PgClient.layerConfig`).
* `SqlClient` is a `Tag` and the client is a statement constructor; statements are effects (so DB queries live natively inside `Effect`).
* You get the `SqlSchema` / `SqlResolver` ecosystem when you’re ready to batch/cache GraphQL nested field fetches (e.g. product→items) in a principled way.

### Oracle

**Use:** the official Node Oracle driver (`oracledb`) wrapped in an Effect `Layer.scoped`.

Reason: as of the current `@effect/sql` API docs, its dialect set is `pg | mysql | mssql | clickhouse | sqlite` (no Oracle dialect).
So: write a small `OracleDb` service with a pool managed by `Layer.scoped`, and validate rows with `Schema.decodeUnknown`.

---

## 2) The architectural “shape” (categorical view)

Think of:

* each **Service** as an *object* in a context category `𝒞`
* each **Layer** as a *morphism* (a resource-creating arrow) from required services to provided services
* **Layer composition** is your (associative) composition in `𝒞`
* `runEffect : Effect<R, E, A> → Promise<A>` is a *natural transformation* once you fix a `Runtime<R>` (the runtime is a “global section” you store in GraphQL context)

Your key requirements become:

* **one** `MasterdataDb` layer (Postgres pool)
* **many** repo/service layers depending on that single `MasterdataDb`
* handlers depend on repos (not on pools)
* resolvers depend on handlers, and run via `runEffect`

---

## 3) End-to-end code for Postgres (shared pool, multiple services)

### 3.1 Install deps

```sh
pnpm add @effect/sql @effect/sql-pg
# pg is pulled transitively in most setups, but if needed:
pnpm add pg
```

### 3.2 Domain schemas (Effect Schema)

`src/domain/product.ts`

```ts
import { Schema } from "effect"

// If you want stronger invariants later, brand these.
// For now: keep old-shape compatibility.
export const ProductIdSchema = Schema.Number.pipe(Schema.int())
export type ProductId = Schema.Schema.Type<typeof ProductIdSchema>

export const ProductSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Product")),
  id: ProductIdSchema,
  description: Schema.NullOr(Schema.String)
})
export type Product = Schema.Schema.Type<typeof ProductSchema>
```

`src/domain/item.ts`

```ts
import { Schema } from "effect"

export const ItemIdSchema = Schema.Number.pipe(Schema.int())
export type ItemId = Schema.Schema.Type<typeof ItemIdSchema>

export const ItemSchema = Schema.Struct({
  __typename: Schema.optional(Schema.Literal("Item")),
  id: ItemIdSchema,
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int())
})
export type Item = Schema.Schema.Type<typeof ItemSchema>
```

These match the old domain shapes (incl. optional `__typename`) and the DB record columns.

---

### 3.3 Config service (Effect Config + redacted secrets)

Update your config service so it *also* carries DB settings.

`src/services/config.ts`

```ts
import { Config, Context, Effect, LogLevel, Redacted } from "effect"
import { portFromNumber, type Port } from "../domain/port"

export type MasterdataPgConfig = {
  readonly url: Redacted.Redacted<string>
  readonly pool: {
    readonly min: number
    readonly max: number
    readonly idleTimeoutMillis: number
  }
}

export type OracleConfig = {
  readonly user: string
  readonly password: Redacted.Redacted<string>
  readonly connectString: string
  readonly pool: {
    readonly min: number
    readonly max: number
    readonly increment: number
  }
}

export type AppConfig = {
  readonly port: Port
  readonly logLevel: LogLevel.LogLevel
  readonly masterdataPg: MasterdataPgConfig
  readonly oracle: OracleConfig
}

export class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  AppConfig
>() {}

export const ConfigLayer = Effect.gen(function* () {
  const port = yield* Config.number("APP_PORT").pipe(Effect.map(portFromNumber))
  const logLevel = yield* Config.logLevel("APP_LOG_LEVEL")

  const masterdataPg: MasterdataPgConfig = {
    url: yield* Config.redacted("MASTERDATA_PG_URL"),
    pool: {
      min: yield* Config.integer("MASTERDATA_PG_POOL_MIN").pipe(Config.withDefault(0)),
      max: yield* Config.integer("MASTERDATA_PG_POOL_MAX").pipe(Config.withDefault(10)),
      idleTimeoutMillis: yield* Config.integer("MASTERDATA_PG_IDLE_TIMEOUT_MS").pipe(
        Config.withDefault(30_000)
      )
    }
  }

  const oracle: OracleConfig = {
    user: yield* Config.string("ORACLE_USER"),
    password: yield* Config.redacted("ORACLE_PASSWORD"),
    connectString: yield* Config.string("ORACLE_CONNECT_STRING"),
    pool: {
      min: yield* Config.integer("ORACLE_POOL_MIN").pipe(Config.withDefault(0)),
      max: yield* Config.integer("ORACLE_POOL_MAX").pipe(Config.withDefault(10)),
      increment: yield* Config.integer("ORACLE_POOL_INCREMENT").pipe(Config.withDefault(1))
    }
  }

  return { port, logLevel, masterdataPg, oracle } as const
}).pipe(
  Effect.map((cfg) => ConfigService.of(cfg))
)
```

Then (as you already do) lift into a layer:

`src/layers/config.ts`

```ts
import { Layer } from "effect"
import { ConfigLayer, ConfigService } from "../services/config"

export const configLayer = Layer.effect(ConfigService, ConfigLayer)
```

Notes:

* `Config.redacted` is the recommended modern way to keep secrets out of logs.
* We’re keeping config as a *service* because you explicitly want other services/loggers to access it.

---

### 3.4 Masterdata Postgres DB service (one pool, shared)

We **do not** want every repo to create its own client/pool. So we create:

* one `MasterdataDb` service: “here is the SQL client”
* one `Layer` that allocates it (scoped)

`src/services/masterdataDb.ts`

```ts
import { Context } from "effect"
import type * as SqlClient from "@effect/sql/SqlClient"

export type MasterdataDbShape = {
  readonly sql: SqlClient.SqlClient
}

export class MasterdataDb extends Context.Tag("MasterdataDb")<
  MasterdataDb,
  MasterdataDbShape
>() {}
```

`src/layers/masterdataDb.ts`

```ts
import { Config, Effect, Layer, Redacted } from "effect"
import * as PgClient from "@effect/sql-pg/PgClient"
import * as SqlClient from "@effect/sql/SqlClient"

import { ConfigService } from "../services/config"
import { MasterdataDb } from "../services/masterdataDb"

export const masterdataDbLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const cfg = yield* ConfigService

    // Build a Config spec *from the already-loaded ConfigService*.
    // Config.succeed exists and is intended for this. :contentReference[oaicite:11]{index=11}
    const pgConfig = Config.succeed({
      url: Redacted.value(cfg.masterdataPg.url),
      min: cfg.masterdataPg.pool.min,
      max: cfg.masterdataPg.pool.max,
      idleTimeoutMillis: cfg.masterdataPg.pool.idleTimeoutMillis,
      transformQueryNames: false,
      transformResultNames: false
    } satisfies PgClient.Config)

    const sqlClientLayer = PgClient.layerConfig(pgConfig) // provides SqlClient.SqlClient

    const layer = Layer.effect(
      MasterdataDb,
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient
        yield* Effect.logInfo("Masterdata Postgres client initialized")
        return { sql } as const
      })
    ).pipe(Layer.provide(sqlClientLayer))

    return layer
  })
)
```

Key point: **all downstream services share the same pool**, because `MasterdataDb` is constructed once and injected.

---

### 3.5 Repo services: ProductRepo + ItemRepo

These are the “many services backed by one DB”.

#### Helpers for decoding rows safely

`src/services/dbDecode.ts`

```ts
import { Effect, Schema } from "effect"

export const decodeOne = <A>(schema: Schema.Schema<A>) => (u: unknown) =>
  Schema.decodeUnknown(schema)(u)

export const decodeMany = <A>(schema: Schema.Schema<A>) => (rows: ReadonlyArray<unknown>) =>
  Effect.forEach(rows, (row) => Schema.decodeUnknown(schema)(row))
```

#### ProductRepo

`src/services/productRepo.ts`

```ts
import { Context, Effect, Option, Schema } from "effect"
import type * as SqlError from "@effect/sql/SqlError"

import { ProductSchema, type Product, type ProductId } from "../domain/product"
import { MasterdataDb } from "./masterdataDb"
import { decodeMany, decodeOne } from "./dbDecode"

export class ProductNotFound extends Error {
  readonly _tag = "ProductNotFound"
  constructor(readonly id: ProductId) {
    super(`Product not found: ${id}`)
  }
}

export type ProductRepoError = SqlError.SqlError | ProductNotFound | Schema.ParseError

export type ProductRepoShape = {
  readonly getById: (id: ProductId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
  readonly list: Effect.Effect<ReadonlyArray<Product>, ProductRepoError>
}

export class ProductRepo extends Context.Tag("ProductRepo")<
  ProductRepo,
  ProductRepoShape
>() {}

// row schema matches DB columns (no __typename)
const ProductRowSchema = Schema.Struct({
  id: Schema.Number.pipe(Schema.int()),
  description: Schema.NullOr(Schema.String)
})

const toDomain = (r: Schema.Schema.Type<typeof ProductRowSchema>): Product => ({
  __typename: "Product",
  ...r
})

export const ProductRepoLive = Effect.gen(function* () {
  const { sql } = yield* MasterdataDb

  const list = sql`
    SELECT id, description
    FROM product
    ORDER BY id
  `.pipe(
    Effect.flatMap(decodeMany(ProductRowSchema)),
    Effect.map((rows) => rows.map(toDomain))
  )

  const getById = (id: ProductId) =>
    sql`
      SELECT id, description
      FROM product
      WHERE id = ${id}
    `.pipe(
      Effect.flatMap((rows) =>
        rows.length === 0
          ? Effect.succeed(Option.none())
          : decodeOne(ProductRowSchema)(rows[0]).pipe(
              Effect.map((row) => Option.some(toDomain(row)))
            )
      )
    )

  return { list, getById } as const
}).pipe(Effect.map((svc) => ProductRepo.of(svc)))
```

`src/layers/productRepo.ts`

```ts
import { Layer } from "effect"
import { ProductRepo, ProductRepoLive } from "../services/productRepo"

export const productRepoLayer = Layer.effect(ProductRepo, ProductRepoLive)
```

#### ItemRepo with “product → items” query (single SQL join)

`src/services/itemRepo.ts`

```ts
import { Context, Effect, Schema } from "effect"
import type * as SqlError from "@effect/sql/SqlError"

import { ItemSchema, type Item, type ItemId } from "../domain/item"
import { type ProductId } from "../domain/product"
import { MasterdataDb } from "./masterdataDb"
import { decodeMany, decodeOne } from "./dbDecode"

export type ItemRepoError = SqlError.SqlError | Schema.ParseError

export type ItemRepoShape = {
  readonly getById: (id: ItemId) => Effect.Effect<Item | null, ItemRepoError>
  readonly listForProduct: (productId: ProductId) => Effect.Effect<ReadonlyArray<Item>, ItemRepoError>
}

export class ItemRepo extends Context.Tag("ItemRepo")<ItemRepo, ItemRepoShape>() {}

const ItemRowSchema = Schema.Struct({
  id: Schema.Number.pipe(Schema.int()),
  description: Schema.NullOr(Schema.String),
  pack_size: Schema.Number.pipe(Schema.int())
})

const toDomain = (r: Schema.Schema.Type<typeof ItemRowSchema>): Item => ({
  __typename: "Item",
  ...r
})

export const ItemRepoLive = Effect.gen(function* () {
  const { sql } = yield* MasterdataDb

  const getById = (id: ItemId) =>
    sql`
      SELECT id, description, pack_size
      FROM item
      WHERE id = ${id}
    `.pipe(
      Effect.flatMap((rows) => (rows.length === 0 ? Effect.succeed(null) : decodeOne(ItemRowSchema)(rows[0]))),
      Effect.map((row) => (row === null ? null : toDomain(row)))
    )

  // product -> many items via item_prod
  const listForProduct = (productId: ProductId) =>
    sql`
      SELECT i.id, i.description, i.pack_size
      FROM item i
      JOIN item_prod ip ON ip.item_id = i.id
      WHERE ip.product_id = ${productId}
      ORDER BY i.id
    `.pipe(
      Effect.flatMap(decodeMany(ItemRowSchema)),
      Effect.map((rows) => rows.map(toDomain))
    )

  return { getById, listForProduct } as const
}).pipe(Effect.map((svc) => ItemRepo.of(svc)))
```

`src/layers/itemRepo.ts`

```ts
import { Layer } from "effect"
import { ItemRepo, ItemRepoLive } from "../services/itemRepo"

export const itemRepoLayer = Layer.effect(ItemRepo, ItemRepoLive)
```

This explicitly fixes the old repo’s N+1 pattern (which fetched item IDs then looped `getItemById`).

---

### 3.6 Compose layers: one DB, many repos

`src/layers/app.ts`

```ts
import { Layer } from "effect"
import { configLayer } from "./config"
import { loggerLayer } from "./logger"

import { masterdataDbLayer } from "./masterdataDb"
import { productRepoLayer } from "./productRepo"
import { itemRepoLayer } from "./itemRepo"

// your existing layers
import { greetingLayer } from "./greeting"

// Base: config then logger (logger depends on config)
export const baseLayer = Layer.mergeAll(
  configLayer,
  loggerLayer
)

// DB depends on config (via ConfigService)
export const dbLayer = masterdataDbLayer.pipe(Layer.provide(baseLayer))

// Repos depend on db (and inherit logging/config via dbLayer’s construction context)
export const reposLayer = Layer.mergeAll(
  productRepoLayer,
  itemRepoLayer
).pipe(Layer.provide(dbLayer))

export const appLayer = Layer.mergeAll(
  baseLayer,
  greetingLayer,
  dbLayer,
  reposLayer
)
```

This makes the dependency DAG explicit and readable.

---

### 3.7 Update AppServices type (so runtime includes repos)

`src/services/index.ts` (or wherever you define it)

```ts
import type { ConfigService } from "./config"
import type { GreetingService } from "./greeting"
import type { MasterdataDb } from "./masterdataDb"
import type { ProductRepo } from "./productRepo"
import type { ItemRepo } from "./itemRepo"

export type AppServices =
  | ConfigService
  | GreetingService
  | MasterdataDb
  | ProductRepo
  | ItemRepo
```

Then your existing `GraphQLContext` runtime being `Runtime.Runtime<AppServices>` scales naturally as you add services.

---

### 3.8 A single GraphQL query end-to-end (product → items)

Handler (purely Effect, depends on repos only):

`src/handlers/product.ts`

```ts
import { Effect } from "effect"
import { ProductRepo } from "../services/productRepo"
import { ItemRepo } from "../services/itemRepo"
import { type ProductId } from "../domain/product"

export const getProductWithItems = (id: ProductId) =>
  Effect.gen(function* () {
    const productRepo = yield* ProductRepo
    const itemRepo = yield* ItemRepo

    const productOpt = yield* productRepo.getById(id)
    if (productOpt._tag === "None") {
      return null
    }

    const product = productOpt.value
    const items = yield* itemRepo.listForProduct(id)

    return { product, items } as const
  })
```

Resolver (your pattern):

`src/graphql/resolvers/product.ts`

```ts
import { resolver, query } from "@gqloom/core"
import { Schema } from "effect"
import { runEffect } from "../effect"

import { ProductSchema } from "../../domain/product"
import { ItemSchema } from "../../domain/item"
import { getProductWithItems } from "../../handlers/product"

// gqloom schema for output type
const ProductWithItemsSchema = Schema.Struct({
  product: ProductSchema,
  items: Schema.Array(ItemSchema)
})

const ProductIdInput = Schema.Struct({ id: Schema.Number.pipe(Schema.int()) })

export const productResolvers = resolver({
  productWithItems: query(Schema.standardSchemaV1(Schema.NullOr(ProductWithItemsSchema)))
    .input(Schema.standardSchemaV1(ProductIdInput))
    .resolve((args) => runEffect(getProductWithItems(args.id)))
})
```

No resolver ever touches pools; all it does is apply the “natural transformation” `runEffect`.

---

## 4) Oracle: an Effect-native pool layer + one validated query

### 4.1 Install

```sh
pnpm add oracledb
```

### 4.2 Oracle service + layer (scoped pool)

`src/services/oracleDb.ts`

```ts
import { Context, Data, Effect, Redacted, Schema } from "effect"
import oracledb from "oracledb"
import { ConfigService } from "./config"

export class OracleError extends Data.TaggedError("OracleError")<{
  readonly cause: unknown
}> {}

export type OracleDbShape = {
  readonly queryMany: <A>(
    statement: string,
    binds: Record<string, unknown>,
    row: Schema.Schema<A>
  ) => Effect.Effect<ReadonlyArray<A>, OracleError>
}

export class OracleDb extends Context.Tag("OracleDb")<OracleDb, OracleDbShape>() {}

export const OracleDbLive = Effect.gen(function* () {
  const cfg = yield* ConfigService

  const pool = yield* Effect.acquireRelease(
    Effect.tryPromise({
      try: () =>
        oracledb.createPool({
          user: cfg.oracle.user,
          password: Redacted.value(cfg.oracle.password),
          connectString: cfg.oracle.connectString,
          poolMin: cfg.oracle.pool.min,
          poolMax: cfg.oracle.pool.max,
          poolIncrement: cfg.oracle.pool.increment
        }),
      catch: (cause) => new OracleError({ cause })
    }),
    (p) =>
      Effect.tryPromise({
        try: () => p.close(0),
        catch: () => undefined
      }).pipe(Effect.orDie)
  )

  const queryMany = <A>(
    statement: string,
    binds: Record<string, unknown>,
    row: Schema.Schema<A>
  ) =>
    Effect.tryPromise({
      try: async () => {
        const conn = await pool.getConnection()
        try {
          const result = await conn.execute(statement, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
          })
          return (result.rows ?? []) as unknown[]
        } finally {
          await conn.close()
        }
      },
      catch: (cause) => new OracleError({ cause })
    }).pipe(
      Effect.flatMap((rows) => Schema.decodeUnknown(Schema.Array(row))(rows)),
      Effect.mapError((cause) => (cause instanceof OracleError ? cause : new OracleError({ cause })))
    )

  return { queryMany } as const
}).pipe(Effect.map((svc) => OracleDb.of(svc)))
```

`src/layers/oracleDb.ts`

```ts
import { Layer } from "effect"
import { OracleDb, OracleDbLive } from "../services/oracleDb"

export const oracleDbLayer = Layer.scoped(OracleDb, OracleDbLive)
```

This is the same “one pool, many services can depend on it” pattern as Postgres—just implemented manually because there’s no `@effect/sql-oracle` dialect.

### 4.3 One Oracle query using Schema validation

Example: fetch product rows (assuming Oracle table/columns; **alias to lower-case keys** to match your schema).

`src/services/oracleProductRepo.ts`

```ts
import { Context, Effect, Schema } from "effect"
import { OracleDb } from "./oracleDb"
import { ProductSchema, type ProductId, type Product } from "../domain/product"

export type OracleProductRepoShape = {
  readonly getById: (id: ProductId) => Effect.Effect<Product | null, unknown>
}

export class OracleProductRepo extends Context.Tag("OracleProductRepo")<
  OracleProductRepo,
  OracleProductRepoShape
>() {}

const ProductRow = Schema.Struct({
  id: Schema.Number.pipe(Schema.int()),
  description: Schema.NullOr(Schema.String)
})

const toDomain = (r: Schema.Schema.Type<typeof ProductRow>): Product => ({
  __typename: "Product",
  ...r
})

export const OracleProductRepoLive = Effect.gen(function* () {
  const oracle = yield* OracleDb

  const getById = (id: ProductId) =>
    oracle
      .queryMany(
        `
        SELECT
          product_id AS "id",
          description AS "description"
        FROM product
        WHERE product_id = :id
        `,
        { id },
        ProductRow
      )
      .pipe(Effect.map((rows) => (rows.length === 0 ? null : toDomain(rows[0]))))

  return { getById } as const
}).pipe(Effect.map((svc) => OracleProductRepo.of(svc)))
```

---

## 5) Why this resolves your “multiple services per DB” concern

Because the dependency graph is now:

* `ConfigService` (one value)
* `MasterdataDb` (one scoped resource = one pool)
* `ProductRepo`, `ItemRepo`, … (arbitrarily many, all depend on the same `MasterdataDb`)
* handlers depend on repos
* resolvers run handlers via `runEffect`

So:

* Adding a new service backed by Postgres is just: define its `Tag` + `Layer.effect(...)` requiring `MasterdataDb`.
* Testing is just: provide a different layer for that service (mock) **without touching GraphQL**.
* GraphQL boundary tests can provide a full test `Runtime<AppServices>` by swapping out some layers (DB → mock DB) and then constructing Yoga via your `makeYoga` effect.

---

## 6) Two optional upgrades you should consider next

### A) Use `SqlResolver.grouped` to kill GraphQL N+1 *categorically*

For `product → items`, you eventually want batching: one query for all product IDs in a request.

`@effect/sql` gives you `SqlResolver.grouped(...)` specifically for this style of batching/caching.
This composes extremely well with GraphQL field resolvers.

### B) Introduce branded IDs (prevents mixing ItemId/ProductId)

Once the “happy path” works, brand IDs so `ItemId ⊄ ProductId` at compile time. It’s a cheap but high-leverage refinement that makes illegal states unrepresentable.

---

If you want, I can take your **current lect-effect file layout** and rewrite the above into *exact* files + exports that match your existing import graph (so you can paste it in with minimal diff), and also show the corresponding **vitest + effect/vitest** harness for:

1. repo-level tests (pure effects, mock DB), and
2. GraphQL boundary tests (Yoga server instance + property tests over Schema-derived arbitraries).
