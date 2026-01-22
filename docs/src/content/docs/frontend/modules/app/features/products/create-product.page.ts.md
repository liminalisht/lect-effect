---
title: app/features/products/create-product.page.ts
nav_order: 17
parent: Modules
---

## create-product.page overview

Composition page for creating a product with items.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductPage (class)](#createproductpage-class)
    - [onSubmit (method)](#onsubmit-method)

---

# utils

## CreateProductPage (class)

Composition page that wires form, result, and store for product creation.

**Signature**

```ts
export declare class CreateProductPage { constructor(readonly store: CreateProductStore) }
```

Added in v1.0.0

### onSubmit (method)

Handles form submit by delegating to the store.

**Signature**

```ts
onSubmit(input: CreateProductWithItemsInput): void
```

Added in v1.0.0
