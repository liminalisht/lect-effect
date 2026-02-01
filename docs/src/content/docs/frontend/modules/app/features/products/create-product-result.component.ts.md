---
title: app/features/products/create-product-result.component.ts
nav_order: 25
parent: Modules
---

## create-product-result.component overview

Result renderer for createProductWithItems remote data.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Components](#components)
  - [CreateProductResultComponent (class)](#createproductresultcomponent-class)
    - [state (property)](#state-property)

---

# Components

## CreateProductResultComponent (class)

Angular component rendering remote data from createProductWithItems.

**Signature**

```ts
export declare class CreateProductResultComponent
```

Added in v0.1.0

### state (property)

Remote data to render.

**Signature**

```ts
state: RemoteData<
  {
    readonly product: {
      readonly __typename?: "Product" | undefined
      readonly id: number
      readonly description: string | null
    }
    readonly items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  },
  unknown
>
```

Added in v0.1.0
