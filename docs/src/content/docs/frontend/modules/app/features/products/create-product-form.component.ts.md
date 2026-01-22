---
title: app/features/products/create-product-form.component.ts
nav_order: 15
parent: Modules
---

## create-product-form.component overview

Standalone form component for creating a product with items (no Angular Forms).

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductFormComponent (class)](#createproductformcomponent-class)
    - [addItem (method)](#additem-method)
    - [removeItem (method)](#removeitem-method)
    - [onProductDescriptionInput (method)](#onproductdescriptioninput-method)
    - [onItemDescriptionInput (method)](#onitemdescriptioninput-method)
    - [onItemPackSizeInput (method)](#onitempacksizeinput-method)
    - [submit (method)](#submit-method)
    - [submitted (property)](#submitted-property)
    - [productDescription (property)](#productdescription-property)
    - [items (property)](#items-property)
    - [canSubmit (property)](#cansubmit-property)

---

# utils

## CreateProductFormComponent (class)

Angular standalone form component for creating a product with items.

**Signature**

```ts
export declare class CreateProductFormComponent
```

Added in v1.0.0

### addItem (method)

Adds a blank item draft row.

**Signature**

```ts
addItem(): void
```

Added in v1.0.0

### removeItem (method)

Removes an item draft by index (keeps at least one row).

**Signature**

```ts
removeItem(index: number): void
```

Added in v1.0.0

### onProductDescriptionInput (method)

Handles product description edits.

**Signature**

```ts
onProductDescriptionInput(event: Event): void
```

Added in v1.0.0

### onItemDescriptionInput (method)

Handles item description edits.

**Signature**

```ts
onItemDescriptionInput(index: number, event: Event): void
```

Added in v1.0.0

### onItemPackSizeInput (method)

Handles item pack size edits.

**Signature**

```ts
onItemPackSizeInput(index: number, event: Event): void
```

Added in v1.0.0

### submit (method)

Emits a validated payload when the draft is valid.

**Signature**

```ts
submit(): void
```

Added in v1.0.0

### submitted (property)

Emits validated create-product payloads.

**Signature**

```ts
readonly submitted: EventEmitter<{ readonly product: { readonly description?: string | null | undefined; }; readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number; }[]; }>
```

Added in v1.0.0

### productDescription (property)

Field for the optional product description (blank → null).

**Signature**

```ts
readonly productDescription: SchemaField<string, string | null>
```

Added in v1.0.0

### items (property)

Draft items being edited in the form.

**Signature**

```ts
readonly items: WritableSignal<readonly ItemDraft[]>
```

Added in v1.0.0

### canSubmit (property)

Whether the form is currently valid and can be submitted.

**Signature**

```ts
readonly canSubmit: Signal<boolean>
```

Added in v1.0.0
