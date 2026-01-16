---
title: services/interfaces/greeting.ts
nav_order: 44
parent: Modules
---

## greeting overview

Greeting service contract.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GreetService (class)](#GreetService-class)
  - [Greet (type alias)](#Greet-type-alias)

---

# utils

## GreetService (class)

Service tag for greeting operations.

**Signature**

```ts
export declare class GreetService
```

Added in v1.0.0

## Greet (type alias)

Interface for the greeting service implementation.

**Signature**

```ts
export type Greet = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>
}
```

Added in v1.0.0
