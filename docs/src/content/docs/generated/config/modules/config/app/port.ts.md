---
title: config/app/port.ts
nav_order: 4
parent: Modules
---

## port overview

TCP port configuration bindings.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Port (type alias)](#port-type-alias)
  - [portSchema](#portschema)

---

# utils

## Port (type alias)

TCP port value object.

**Signature**

```ts
export type Port = Schema.Schema.Type<typeof portSchema>
```

Added in v1.0.0

## portSchema

Schema for validating TCP ports.

**Signature**

```ts
export declare const portSchema: Schema.brand<Schema.filter<Schema.filter<typeof Schema.Number>>, "Port">
```

Added in v1.0.0
