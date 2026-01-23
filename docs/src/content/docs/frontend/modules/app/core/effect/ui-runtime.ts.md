---
title: app/core/effect/ui-runtime.ts
nav_order: 16
parent: Modules
---

## ui-runtime overview

Managed Effect runtime wiring for the UI layer.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Services](#services)
  - [UiRuntime (class)](#uiruntime-class)
    - [runExit (property)](#runexit-property)
    - [runPromise (property)](#runpromise-property)

---

# Services

## UiRuntime (class)

Facade for running Effect programs within the Angular app lifecycle.

**Signature**

```ts
export declare class UiRuntime {
  constructor()
}
```

Added in v1.0.0

### runExit (property)

Run an Effect and capture its Exit using the shared runtime.

**Signature**

```ts
runExit: <A, E, R extends AppEnv>(effect: Effect.Effect<A, E, R>) => Promise<Exit.Exit<A, E>>
```

Added in v1.0.0

### runPromise (property)

Run an Effect and resolve its success value using the shared runtime.

**Signature**

```ts
runPromise: <A, E, R extends AppEnv>(effect: Effect.Effect<A, E, R>) => Promise<A>
```

Added in v1.0.0
