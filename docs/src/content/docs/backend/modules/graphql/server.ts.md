---
title: graphql/server.ts
nav_order: 8
parent: Modules
---

## server overview

HTTP server lifecycle helpers for GraphQL Yoga.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Server Utilities](#graphql-server-utilities)
  - [listen](#listen)

---

# GraphQL Server Utilities

## listen

Starts an HTTP server for the provided Yoga instance.

**Signature**

```ts
export declare const listen: <R>(yoga: Yoga<R>, port: number) => Effect.Effect<Server, ServerStartError, Scope>
```

Added in v0.1.0
