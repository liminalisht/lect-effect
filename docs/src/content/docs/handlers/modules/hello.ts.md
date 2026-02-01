---
title: hello.ts
nav_order: 2
parent: Modules
---

## hello overview

Hello handler providing a greeting based on optional name input.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Hello Handler Effects](#hello-handler-effects)
  - [helloHandler](#hellohandler)
- [Hello Handlers](#hello-handlers)
  - [greetQuery](#greetquery)
  - [helloHandlers](#hellohandlers)

---

# Hello Handler Effects

## helloHandler

Produces a greeting response using the greeting service.

**Signature**

```ts
export declare const helloHandler: (input: NameInput) => Effect.Effect<HelloResponse, never, GreetService>
```

Added in v0.1.0

# Hello Handlers

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

Added in v0.1.0

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

Added in v0.1.0
