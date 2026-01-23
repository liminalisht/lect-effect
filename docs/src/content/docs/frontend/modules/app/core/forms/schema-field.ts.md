---
title: app/core/forms/schema-field.ts
nav_order: 17
parent: Modules
---

## schema-field overview

Schema-governed form field helpers built on Angular signals.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [SchemaField (type alias)](#schemafield-type-alias)
  - [schemaField](#schemafield)
  - [stringToInt](#stringtoint)
  - [stringToNullIfBlank](#stringtonullifblank)

---

# utils

## SchemaField (type alias)

Schema-backed form field interface with raw + derived validation signals.

**Signature**

```ts
export type SchemaField<Raw, A> = {
  readonly raw: WritableSignal<Raw>
  readonly parsed: Signal<Either.Either<A, ParseError>>
  readonly value: Signal<A | null>
  readonly error: Signal<ParseError | null>
  readonly isValid: Signal<boolean>
  readonly setRaw: (raw: Raw) => void
}
```

Added in v1.0.0

## schemaField

Builds a schema-backed form field with derived validation signals.

**Signature**

```ts
export declare const schemaField: <Raw, A>(options: SchemaFieldOptions<Raw, A>) => SchemaField<Raw, A>
```

Added in v1.0.0

## stringToInt

Parses an integer or returns null when blank/invalid.

**Signature**

```ts
export declare const stringToInt: (value: string) => number | null
```

Added in v1.0.0

## stringToNullIfBlank

Trims a string and returns null when blank.

**Signature**

```ts
export declare const stringToNullIfBlank: (value: string) => string | null
```

Added in v1.0.0
