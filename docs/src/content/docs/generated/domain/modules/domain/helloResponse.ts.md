---
title: domain/helloResponse.ts
nav_order: 3
parent: Modules
---

## helloResponse overview

Response envelope for the hello operation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [HelloResponse (type alias)](#helloresponse-type-alias)
  - [helloResponseSchema](#helloresponseschema)

---

# utils

## HelloResponse (type alias)

Response structure returned by the hello operation.

**Signature**

```ts
export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>
```

Added in v1.0.0

## helloResponseSchema

Schema for the hello response envelope.

**Signature**

```ts
export declare const helloResponseSchema: Schema.Struct<{ greeting: Schema.brand<typeof Schema.String, "Greeting"> }>
```

Added in v1.0.0
