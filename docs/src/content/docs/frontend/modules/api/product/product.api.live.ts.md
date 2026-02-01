---
title: api/product/product.api.live.ts
nav_order: 6
parent: Modules
---

## product.api.live overview

Live implementation of the product API backed by GraphQL.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Implementations](#service-implementations)
  - [productApiLive](#productapilive)

---

# Service Implementations

## productApiLive

Layer constructor yielding the live product API service.

**Signature**

```ts
export declare const productApiLive: Effect.Effect<ProductApi, never, GraphQLClientService>
```

Added in v0.1.0
