---
title: services/greeting/layer.ts
nav_order: 16
parent: Modules
---

## layer overview

Greeting service layer wiring.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Layers](#layers)
  - [greetingLayer](#greetinglayer)
- [Service Implementations](#service-implementations)
  - [GreetServiceImplementation](#greetserviceimplementation)

---

# Layers

## greetingLayer

Provides the GreetService implementation.

**Signature**

```ts
export declare const greetingLayer: Layer.Layer<GreetService, never, never>
```

Added in v0.1.0

# Service Implementations

## GreetServiceImplementation

Concrete greeting service implementation.

**Signature**

```ts
export declare const GreetServiceImplementation: Greet
```

Added in v0.1.0
