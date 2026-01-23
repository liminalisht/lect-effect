---
title: app/features/products/create-product.store.ts
nav_order: 27
parent: Modules
---

## create-product.store overview

Store orchestrating the createProductWithItems mutation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductStore (class)](#createproductstore-class)
    - [create (method)](#create-method)
    - [state (property)](#state-property)

---

# utils

## CreateProductStore (class)

Feature store for product creation with associated items.

**Signature**

```ts
export declare class CreateProductStore
```

Added in v1.0.0

### create (method)

Runs the createProductWithItems mutation and updates remote data.

**Signature**

```ts
async create(input: unknown): Promise<void>
```

Added in v1.0.0

### state (property)

Remote data state for the view.

**Signature**

```ts
readonly state: WritableSignal<RemoteData<Cause.Cause<ProductApiError>, { readonly product: { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null; }; readonly items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number; }[]; }>>
```

Added in v1.0.0
