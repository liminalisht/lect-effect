---
title: masterdataDbConfig/interface.ts
nav_order: 19
parent: Modules
---

## interface overview

Master data database configuration contracts.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Interfaces](#service-interfaces)
  - [MasterdataDbConfig (type alias)](#masterdatadbconfig-type-alias)
- [Services](#services)
  - [MasterdataDbConfigService (class)](#masterdatadbconfigservice-class)

---

# Service Interfaces

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

Added in v0.1.0

# Services

## MasterdataDbConfigService (class)

Tag for accessing master data DB configuration.

**Signature**

```ts
export declare class MasterdataDbConfigService
```

Added in v0.1.0
