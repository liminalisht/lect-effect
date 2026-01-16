---
title: services/greeting/layer.ts
nav_order: 46
parent: Modules
---

## layer overview

Greeting service layer wiring.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GreetServiceImplementation](#greetserviceimplementation)
  - [greetingLayer](#greetinglayer)

---

# utils

## GreetServiceImplementation

Concrete greeting service implementation.

**Signature**

```ts
export declare const GreetServiceImplementation: Greet
```

Added in v1.0.0

## greetingLayer

Provides the GreetService implementation.

**Signature**

```ts
export declare const greetingLayer: Layer.Layer<GreetService, never, never>
```

Added in v1.0.0
