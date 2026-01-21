---
title: index.ts
nav_order: 14
parent: Modules
---

## index overview

Application entrypoint wiring runtime and top-level effects.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [logFailure](#logfailure)
  - [main](#main)

---

# utils

## logFailure

Logs an exhaustive failure cause in a human-readable format.

**Signature**

```ts
export declare const logFailure: (cause: Cause.Cause<unknown>) => Effect.Effect<[void, void], never, never>
```

Added in v1.0.0

## main

Main Effect wiring the app with its layer and exit logging.

**Signature**

```ts
export declare const main: Effect.Effect<never, AppError, never>
```

Added in v1.0.0
