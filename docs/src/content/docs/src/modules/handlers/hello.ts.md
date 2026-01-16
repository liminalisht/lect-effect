---
title: handlers/hello.ts
nav_order: 35
parent: Modules
---

## hello overview

Hello handler providing a greeting based on optional name input.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [greetQuery](#greetquery)
  - [helloHandler](#hellohandler)
  - [helloHandlers](#hellohandlers)

---

# utils

## greetQuery

Query handler for greeting users.

**Signature**

```ts
export declare const greetQuery: QueryHandler<
  Struct<{ name: NullishOr<SchemaClass<string, string, never>> }>,
  Struct<{ greeting: brand<typeof String, "Greeting"> }>,
  never,
  GreetService
>
```

Added in v1.0.0

## helloHandler

Produces a greeting response using the greeting service.

**Signature**

```ts
export declare const helloHandler: (input: NameInput) => Effect.Effect<HelloResponse, never, GreetService>
```

Added in v1.0.0

## helloHandlers

Registered hello handlers for GraphQL resolver conversion.

**Signature**

```ts
export declare const helloHandlers: QueryHandler<
  Struct<{ name: NullishOr<SchemaClass<string, string, never>> }>,
  Struct<{ greeting: brand<typeof String, "Greeting"> }>,
  never,
  GreetService
>[]
```

Added in v1.0.0
