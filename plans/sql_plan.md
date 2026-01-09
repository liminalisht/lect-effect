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
