---
title: graphql/effect.ts
nav_order: 28
parent: Modules
---

## effect overview

GraphQL utilities for running Effect programs.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [runEffect](#runeffect)

---

# utils

## runEffect

Natural transformation `Effect<A, E, AppServices> -> Promise<A>`.

**Signature**

```ts
export declare const runEffect: <A, E, R>(eff: Effect.Effect<A, E, R>) => Promise<A>
```

Added in v1.0.0
Pass any Effect whose requirements are a sub-union of `AppServices`.
