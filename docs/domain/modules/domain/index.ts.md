---
title: domain/index.ts
nav_order: 4
parent: Modules
---

## index overview

Domain module barrel exports.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From './environment'](#from-environment)
  - [From './greeting'](#from-greeting)
  - [From './helloResponse'](#from-helloresponse)
  - [From './item'](#from-item)
  - [From './name'](#from-name)
  - [From './nameInput'](#from-nameinput)
  - [From './port'](#from-port)
  - [From './product'](#from-product)
- [utils](#utils)
  - [CreateProductWithItemsInput (type alias)](#createproductwithitemsinput-type-alias)
  - [ProductWithItems (type alias)](#productwithitems-type-alias)
  - [createProductWithItemsInputSchema](#createproductwithitemsinputschema)
  - [productWithItemsSchema](#productwithitemsschema)

---

# exports

## From './environment'

Re-exports all named exports from the './environment' module.

**Signature**

```ts
export * from "./environment"
```

Added in v1.0.0

## From './greeting'

Re-exports all named exports from the './greeting' module.

**Signature**

```ts
export * from "./greeting"
```

Added in v1.0.0

## From './helloResponse'

Re-exports all named exports from the './helloResponse' module.

**Signature**

```ts
export * from "./helloResponse"
```

Added in v1.0.0

## From './item'

Re-exports all named exports from the './item' module.

**Signature**

```ts
export * from "./item"
```

Added in v1.0.0

## From './name'

Re-exports all named exports from the './name' module.

**Signature**

```ts
export * from "./name"
```

Added in v1.0.0

## From './nameInput'

Re-exports all named exports from the './nameInput' module.

**Signature**

```ts
export * from "./nameInput"
```

Added in v1.0.0

## From './port'

Re-exports all named exports from the './port' module.

**Signature**

```ts
export * from "./port"
```

Added in v1.0.0

## From './product'

Re-exports all named exports from the './product' module.

**Signature**

```ts
export * from "./product"
```

Added in v1.0.0

# utils

## CreateProductWithItemsInput (type alias)

**Signature**

```ts
export type CreateProductWithItemsInput = CreateProductWithItemsInput_
```

Added in v1.0.0

## ProductWithItems (type alias)

**Signature**

```ts
export type ProductWithItems = ProductWithItems_
```

Added in v1.0.0

## createProductWithItemsInputSchema

**Signature**

```ts
export declare const createProductWithItemsInputSchema: Struct<{
  product: Struct<{ description: optional<NullOr<typeof String>> }>
  items: Array$<Struct<{ description: optional<NullOr<typeof String>>; pack_size: filter<typeof Number> }>>
}>
```

Added in v1.0.0

## productWithItemsSchema

**Signature**

```ts
export declare const productWithItemsSchema: Struct<{
  product: Struct<{
    __typename: optional<Literal<["Product"]>>
    id: filter<typeof Number>
    description: NullOr<typeof String>
  }>
  items: Array$<
    Struct<{
      __typename: optional<Literal<["Item"]>>
      id: filter<typeof Number>
      description: NullOr<typeof String>
      pack_size: filter<typeof Number>
    }>
  >
}>
```

Added in v1.0.0
