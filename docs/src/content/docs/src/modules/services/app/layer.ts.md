---
title: services/app/layer.ts
nav_order: 34
parent: Modules
---

## layer overview

Application layer composition.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [app](#app)
  - [appConfig](#appconfig)
  - [appLayer](#applayer)
  - [configuredLogger](#configuredlogger)
  - [configuredMasterdataDb](#configuredmasterdatadb)
  - [greeting](#greeting)
  - [itemRepo](#itemrepo)
  - [logger](#logger)
  - [masterdataDb](#masterdatadb)
  - [masterdataDbConfig](#masterdatadbconfig)
  - [masterdataRepos](#masterdatarepos)
  - [productRepo](#productrepo)

---

# utils

## app

Full application layer wiring services and infrastructure.

**Signature**

```ts
export declare const app: Layer.Layer<AppServices, AppError, never>
```

Added in v1.0.0

## appConfig

Layer loading app configuration.

**Signature**

```ts
export declare const appConfig: Layer.Layer<AppConfigService, ConfigError, never>
```

Added in v1.0.0

## appLayer

Exported application layer alias.

**Signature**

```ts
export declare const appLayer: Layer.Layer<AppServices, AppError, never>
```

Added in v1.0.0

## configuredLogger

Logger provided with configuration.

**Signature**

```ts
export declare const configuredLogger: Layer.Layer<never, ConfigError, never>
```

Added in v1.0.0

## configuredMasterdataDb

Masterdata DB provided with configuration.

**Signature**

```ts
export declare const configuredMasterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError, never>
```

Added in v1.0.0

## greeting

Greeting service layer.

**Signature**

```ts
export declare const greeting: Layer.Layer<GreetService, never, never>
```

Added in v1.0.0

## itemRepo

Item repository layer.

**Signature**

```ts
export declare const itemRepo: Layer.Layer<ItemRepoService, SqlError | ConfigError, MasterdataDbService>
```

Added in v1.0.0

## logger

Logger layer requiring app config.

**Signature**

```ts
export declare const logger: Layer.Layer<never, never, AppConfigService>
```

Added in v1.0.0

## masterdataDb

Raw masterdata DB layer.

**Signature**

```ts
export declare const masterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError, MasterdataDbConfigService>
```

Added in v1.0.0

## masterdataDbConfig

Layer loading DB configuration.

**Signature**

```ts
export declare const masterdataDbConfig: Layer.Layer<MasterdataDbConfigService, ConfigError, never>
```

Added in v1.0.0

## masterdataRepos

Combined repository layers with DB provided.

**Signature**

```ts
export declare const masterdataRepos: Layer.Layer<ItemRepoService | ProductRepoService, SqlError | ConfigError, never>
```

Added in v1.0.0

## productRepo

Product repository layer.

**Signature**

```ts
export declare const productRepo: Layer.Layer<ProductRepoService, SqlError | ConfigError, MasterdataDbService>
```

Added in v1.0.0
