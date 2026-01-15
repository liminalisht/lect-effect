---
title: services/implementations/masterdataDb.ts
nav_order: 40
parent: Modules
---

## masterdataDb overview

MasterdataDb service implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [masterdataDbImplementation](#masterdatadbimplementation)

---

# utils

## masterdataDbImplementation

Live implementation of the MasterdataDb service

**Signature**

```ts
export declare const masterdataDbImplementation: Effect.Effect<
  { readonly sql: SqlClient.SqlClient },
  never,
  SqlClient.SqlClient
>
```

Added in v1.0.0
