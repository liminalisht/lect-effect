---
title: app/features/hello/hello.store.ts
nav_order: 12
parent: Modules
---

## hello.store overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [HelloStore (class)](#hellostore-class)
    - [setName (method)](#setname-method)
    - [run (method)](#run-method)
    - [name (property)](#name-property)
    - [state (property)](#state-property)
    - [greeting (property)](#greeting-property)

---

# utils

## HelloStore (class)

Store backing the Hello page; handles user input and maps Effect results to remote data.

**Signature**

```ts
export declare class HelloStore
```

Added in v1.0.0

### setName (method)

Sets the current name input value.

**Signature**

```ts
setName(name: string): void
```

Added in v1.0.0

### run (method)

Executes the greeting call and updates remote data state.

**Signature**

```ts
async run(): Promise<void>
```

Added in v1.0.0

### name (property)

Readonly view of the current name input.

**Signature**

```ts
readonly name: Signal<string>
```

Added in v1.0.0

### state (property)

Readonly view of the hello request remote data state.

**Signature**

```ts
readonly state: Signal<RemoteData<unknown, { readonly greeting: string & Brand<"Greeting">; }>>
```

Added in v1.0.0

### greeting (property)

Derived greeting when the remote data is successful.

**Signature**

```ts
readonly greeting: Signal<(string & Brand<"Greeting">) | null>
```

Added in v1.0.0
