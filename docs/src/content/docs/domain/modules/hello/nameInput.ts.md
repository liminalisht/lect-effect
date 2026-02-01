---
title: hello/nameInput.ts
nav_order: 5
parent: Modules
---

## nameInput overview

Hello domain input payloads.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [nameInputSchema](#nameinputschema)
- [Domain Types](#domain-types)
  - [NameInput (type alias)](#nameinput-type-alias)

---

# Domain Schemas

## nameInputSchema

Schema for the optional greeting name input.

**Signature**

```ts
export declare const nameInputSchema: Schema.Struct<{
  name: Schema.NullishOr<Schema.SchemaClass<string, string, never>>
}>
```

Added in v0.1.0

# Domain Types

## NameInput (type alias)

Input payload for greeting by name.

**Signature**

```ts
export type NameInput = Schema.Schema.Type<typeof nameInputSchema>
```

Added in v0.1.0
