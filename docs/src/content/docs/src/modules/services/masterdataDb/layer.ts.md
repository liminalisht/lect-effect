---
title: services/masterdataDb/layer.ts
nav_order: 53
parent: Modules
---

## layer overview

Masterdata database layer wiring.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [masterdataDbLayer](#masterdatadblayer)

---

# utils

## masterdataDbLayer

Provides the live masterdata database client.

**Signature**

```ts
export declare const masterdataDbLayer: Layer.Layer<
  MasterdataDbService,
  SqlError | ConfigError,
  MasterdataDbConfigService
>
```

Added in v1.0.0
