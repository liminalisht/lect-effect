---
title: hello/helloResponse.ts
nav_order: 3
parent: Modules
---

## helloResponse overview

Hello domain response envelope definitions.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [helloResponseSchema](#helloresponseschema)
- [Domain Types](#domain-types)
  - [HelloResponse (type alias)](#helloresponse-type-alias)

---

# Domain Schemas

## helloResponseSchema

Schema for the hello response envelope.

**Signature**

```ts
export declare const helloResponseSchema: Schema.Struct<{ greeting: Schema.brand<typeof Schema.String, "Greeting"> }>
```

Added in v0.1.0

# Domain Types

## HelloResponse (type alias)

Response structure returned by the hello operation.

**Signature**

```ts
export type HelloResponse = Schema.Schema.Type<typeof helloResponseSchema>
```

Added in v0.1.0
