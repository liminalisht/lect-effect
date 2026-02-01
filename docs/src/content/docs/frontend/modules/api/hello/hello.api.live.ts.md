---
title: api/hello/hello.api.live.ts
nav_order: 3
parent: Modules
---

## hello.api.live overview

Live implementation of the hello API backed by GraphQL.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Implementations](#service-implementations)
  - [helloApiLive](#helloapilive)

---

# Service Implementations

## helloApiLive

Layer constructor yielding the live hello API service.

**Signature**

```ts
export declare const helloApiLive: Effect.Effect<HelloApi, never, GraphQLClientService>
```

Added in v0.1.0
