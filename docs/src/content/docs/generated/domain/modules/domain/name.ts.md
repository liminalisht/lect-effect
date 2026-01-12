---
title: domain/name.ts
nav_order: 6
parent: Modules
---

## name overview

Name value object schema.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Name (type alias)](#name-type-alias)
  - [nameSchema](#nameschema)

---

# utils

## Name (type alias)

Person name value object.

**Signature**

```ts
export type Name = Schema.Schema.Type<typeof nameSchema>
```

Added in v1.0.0

## nameSchema

Schema for validated names.

**Signature**

```ts
export declare const nameSchema: typeof Schema.String
```

Added in v1.0.0
