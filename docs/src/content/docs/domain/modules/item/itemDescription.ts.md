---
title: item/itemDescription.ts
nav_order: 8
parent: Modules
---

## itemDescription overview

Item description value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [itemDescriptionSchema](#itemdescriptionschema)
- [Domain Types](#domain-types)
  - [ItemDescription (type alias)](#itemdescription-type-alias)

---

# Domain Schemas

## itemDescriptionSchema

Schema for nullable item descriptions.

**Signature**

```ts
export declare const itemDescriptionSchema: Schema.NullOr<typeof Schema.String>
```

Added in v1.0.0

# Domain Types

## ItemDescription (type alias)

Item description value.

**Signature**

```ts
export type ItemDescription = Schema.Schema.Type<typeof itemDescriptionSchema>
```

Added in v1.0.0
