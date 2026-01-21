---
title: graphql/effect.ts
nav_order: 4
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

Natural transformation `Effect<A, E, R> -> Promise<A>`.

**Signature**

```ts
export declare const runEffect: <A, E, R>(eff: Effect.Effect<A, E, R>) => Promise<A>
```

Added in v1.0.0
e.g. pass any Effect whose requirements are a sub-union of `AppServices`.
