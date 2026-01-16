---
title: services/masterdataDb/interface.ts
nav_order: 52
parent: Modules
---

## interface overview

Masterdata database service contract.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [MasterdataDb (type alias)](#masterdatadb-type-alias)
  - [MasterdataDbService (class)](#masterdatadbservice-class)

---

# utils

## MasterdataDb (type alias)

Shape for the masterdata database service.

**Signature**

```ts
export type MasterdataDb = {
  readonly sql: SqlClient.SqlClient
}
```

Added in v1.0.0

## MasterdataDbService (class)

Service tag for accessing the masterdata database client.

**Signature**

```ts
export declare class MasterdataDbService
```

Added in v1.0.0
