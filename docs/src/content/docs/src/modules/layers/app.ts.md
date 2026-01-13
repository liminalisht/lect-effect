---
title: layers/app.ts
nav_order: 45
parent: Modules
---

## app overview

Application layer composition.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [appLayer](#applayer)
  - [configAndLoggerLayer](#configandloggerlayer)
  - [dbLayer](#dblayer)
  - [reposLayer](#reposlayer)

---

# utils

## appLayer

Full application layer wiring all dependencies.

**Signature**

```ts
export declare const appLayer: Layer.Layer<AppServices, AppError, never>
```

Added in v1.0.0

## configAndLoggerLayer

Combines config and logger layers, wiring logger with config.

**Signature**

```ts
export declare const configAndLoggerLayer: Layer.Layer<ConfigService, ConfigError, never>
```

Added in v1.0.0

## dbLayer

Database layer with configuration/logging provided.

**Signature**

```ts
export declare const dbLayer: Layer.Layer<MasterdataDb, SqlError | ConfigError, never>
```

Added in v1.0.0

## reposLayer

Repository layer composition (product + item).

**Signature**

```ts
export declare const reposLayer: Layer.Layer<ProductRepo | ItemRepo, SqlError | ConfigError, never>
```

Added in v1.0.0
