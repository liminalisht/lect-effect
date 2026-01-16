---
title: services/masterdataDbConfig/interface.ts
nav_order: 55
parent: Modules
---

## interface overview

Master data database configuration contracts.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [MasterdataDbConfig (type alias)](#masterdatadbconfig-type-alias)
  - [MasterdataDbConfigService (class)](#masterdatadbconfigservice-class)

---

# utils

## MasterdataDbConfig (type alias)

Configuration for the master data database connection and pool.

**Signature**

```ts
export type MasterdataDbConfig = {
  readonly url: Url
  readonly pool: {
    readonly min: PoolMin
    readonly max: PoolMax
    readonly idleTimeoutMillis: IdleTimeoutMillis
  }
}
```

Added in v1.0.0

## MasterdataDbConfigService (class)

Tag for accessing master data DB configuration.

**Signature**

```ts
export declare class MasterdataDbConfigService
```

Added in v1.0.0
