---
title: app/features/products/create-product-result.component.ts
nav_order: 25
parent: Modules
---

## create-product-result.component overview

Result renderer for createProductWithItems remote data.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductResultComponent (class)](#createproductresultcomponent-class)
    - [state (property)](#state-property)

---

# utils

## CreateProductResultComponent (class)

Angular component rendering remote data from createProductWithItems.

**Signature**

```ts
export declare class CreateProductResultComponent
```

Added in v1.0.0

### state (property)

Remote data to render.

**Signature**

```ts
state: RemoteData<
  unknown,
  {
    readonly product: {
      readonly __typename?: "Product" | undefined
      readonly id: number
      readonly description: string | null
    }
    readonly items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  }
>
```

Added in v1.0.0
