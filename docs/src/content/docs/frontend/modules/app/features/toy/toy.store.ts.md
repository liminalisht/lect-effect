---
title: app/features/toy/toy.store.ts
nav_order: 29
parent: Modules
---

## toy.store overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Stores](#stores)
  - [ToyStore (class)](#toystore-class)
    - [run (method)](#run-method)
    - [state (property)](#state-property)

---

# Stores

## ToyStore (class)

Toy feature store that runs an Effect and maps it to remote data state.

**Signature**

```ts
export declare class ToyStore { constructor(private readonly runtime: UiRuntime) }
```

Added in v1.0.0

### run (method)

Runs the example effect and updates the remote data signal.

**Signature**

```ts
run(): void
```

Added in v1.0.0

### state (property)

Remote data state reflected into the view.

**Signature**

```ts
readonly state: WritableSignal<RemoteData<number, unknown>>
```

Added in v1.0.0
