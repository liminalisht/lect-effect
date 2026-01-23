---
title: hello/name.ts
nav_order: 4
parent: Modules
---

## name overview

Hello domain name value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [nameSchema](#nameschema)
- [Domain Types](#domain-types)
  - [Name (type alias)](#name-type-alias)

---

# Domain Schemas

## nameSchema

Schema for validated names.

**Signature**

```ts
export declare const nameSchema: Schema.SchemaClass<string, string, never>
```

Added in v1.0.0

# Domain Types

## Name (type alias)

Person name value object.

**Signature**

```ts
export type Name = Schema.Schema.Type<typeof nameSchema>
```

Added in v1.0.0
