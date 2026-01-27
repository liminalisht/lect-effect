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
  readonly initial: <A, E>() => RemoteData<A, E>
  readonly loading: <A, E>() => RemoteData<A, E>
  readonly failure: <A, E>(error: E) => RemoteData<A, E>
  readonly success: <A, E>(value: A) => RemoteData<A, E>
}
```

Added in v1.0.0

# Types

## RemoteData (type alias)

Remote data helpers for representing async UI states.

**Signature**

```ts
export type RemoteData<A, E> =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Failure"; readonly error: E }
  | { readonly _tag: "Success"; readonly value: A }
```

Added in v1.0.0
