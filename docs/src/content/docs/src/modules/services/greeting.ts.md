---
title: services/greeting.ts
nav_order: 41
parent: Modules
---

## greeting overview

Greeting service contract.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GreetingService (class)](#greetingservice-class)
  - [GreetingServiceShape (type alias)](#greetingserviceshape-type-alias)

---

# utils

## GreetingService (class)

Service tag for greeting operations.

**Signature**

```ts
export declare class GreetingService
```

Added in v1.0.0

## GreetingServiceShape (type alias)

Interface for the greeting service implementation.

**Signature**

```ts
export type GreetingServiceShape = {
  readonly greet: (name: Option.Option<Name>) => Effect.Effect<Greeting>
}
```

Added in v1.0.0
