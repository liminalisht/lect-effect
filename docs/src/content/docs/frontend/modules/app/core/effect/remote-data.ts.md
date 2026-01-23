---
title: app/core/effect/remote-data.ts
nav_order: 15
parent: Modules
---

## remote-data overview

Remote data discriminated union for UI loading states.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Constructors](#constructors)
  - [remoteData](#remotedata)
- [Types](#types)
  - [RemoteData (type alias)](#remotedata-type-alias)

---

# Constructors

## remoteData

Helpers to construct remote data values.

**Signature**

```ts
export declare const remoteData: {
  readonly initial: <E, A>() => RemoteData<E, A>
  readonly loading: <E, A>() => RemoteData<E, A>
  readonly failure: <E, A>(error: E) => RemoteData<E, A>
  readonly success: <E, A>(value: A) => RemoteData<E, A>
}
```

Added in v1.0.0

# Types

## RemoteData (type alias)

Remote data helpers for representing async UI states.

**Signature**

```ts
export type RemoteData<E, A> =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Failure"; readonly error: E }
  | { readonly _tag: "Success"; readonly value: A }
```

Added in v1.0.0
