---
title: app/core/effect/ui-runtime.ts
nav_order: 9
parent: Modules
---

## ui-runtime overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [UiRuntime (class)](#uiruntime-class)
    - [runExit (method)](#runexit-method)

---

# utils

## UiRuntime (class)

Managed runtime facade exposed to UI features.

**Signature**

```ts
export declare class UiRuntime {
  constructor(destroyRef: DestroyRef)
}
```

Added in v1.0.0

### runExit (method)

Runs an Effect using the configured runtime and returns its Exit value.

**Signature**

```ts
async runExit<A, E>(effect: Effect.Effect<A, E, GraphQLClient>): Promise<Exit.Exit<A, E>>
```

Added in v1.0.0
