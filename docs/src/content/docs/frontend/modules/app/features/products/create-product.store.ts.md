---
title: app/features/products/create-product.store.ts
nav_order: 27
parent: Modules
---

## create-product.store overview

Store orchestrating the createProductWithItems mutation.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Stores](#stores)
  - [CreateProductStore (class)](#createproductstore-class)
    - [create (method)](#create-method)
    - [state (property)](#state-property)

---

# Stores

## CreateProductStore (class)

Feature store for product creation with associated items.

**Signature**

```ts
export declare class CreateProductStore
```

Added in v0.1.0

### create (method)

Runs the createProductWithItems mutation and updates remote data.

**Signature**

```ts
async create(input: unknown): Promise<void>
```

Added in v0.1.0

### state (property)

Remote data state for the view.

**Signature**

```ts
readonly state: WritableSignal<RemoteData<{ readonly product: { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null; }; readonly items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number; }[]; }, Cause.Cause<ProductApiError>>>
```

Added in v0.1.0
