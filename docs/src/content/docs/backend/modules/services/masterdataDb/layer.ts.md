---
title: services/masterdataDb/layer.ts
nav_order: 21
parent: Modules
---

## layer overview

Masterdata database layer wiring.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Layers](#layers)
  - [masterdataDbLayer](#masterdatadblayer)

---

# Layers

## masterdataDbLayer

Provides the live masterdata database client.

**Signature**

```ts
export declare const masterdataDbLayer: Layer.Layer<
  MasterdataDbService,
  ConfigError | SqlError,
  MasterdataDbConfigService
>
```

Added in v1.0.0
