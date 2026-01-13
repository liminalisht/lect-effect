---
title: handlers/hello.ts
nav_order: 1
parent: Modules
---

## hello overview

Hello handler providing a greeting based on optional name input.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [helloHandler](#hellohandler)

---

# utils

## helloHandler

Produces a greeting response using the greeting service.

**Signature**

```ts
export declare const helloHandler: (input: NameInput) => Effect.Effect<HelloResponse, never, GreetingService>
```

Added in v1.0.0
