---
title: services/greeting/interface.ts
nav_order: 27
parent: Modules
---

## interface overview

Greeting service contract.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Greet (type alias)](#greet-type-alias)
  - [GreetService (class)](#greetservice-class)

---

# utils

## Greet (type alias)

Interface for the greeting service implementation.

**Signature**

```ts
export type Greet = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>
}
```

Added in v1.0.0

## GreetService (class)

Service tag for greeting operations.

**Signature**

```ts
export declare class GreetService
```

Added in v1.0.0
