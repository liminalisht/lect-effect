---
title: masterdataDb/interface.ts
nav_order: 17
parent: Modules
---

## interface overview

Masterdata database service contract.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Interfaces](#service-interfaces)
  - [MasterdataDb (type alias)](#masterdatadb-type-alias)
- [Services](#services)
  - [MasterdataDbService (class)](#masterdatadbservice-class)

---

# Service Interfaces

## MasterdataDb (type alias)

Shape for the masterdata database service.

**Signature**

```ts
export type MasterdataDb = {
  readonly sql: SqlClient.SqlClient
}
```

Added in v1.0.0

# Services

## MasterdataDbService (class)

Service tag for accessing the masterdata database client.

**Signature**

```ts
export declare class MasterdataDbService
```

Added in v1.0.0
