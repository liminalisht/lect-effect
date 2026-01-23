---
title: app/features/hello/hello.store.ts
nav_order: 23
parent: Modules
---

## hello.store overview

Store backing the Hello feature page.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Stores](#stores)
  - [HelloStore (class)](#hellostore-class)
    - [setName (method)](#setname-method)
    - [run (method)](#run-method)
    - [name (property)](#name-property)
    - [state (property)](#state-property)
    - [greeting (property)](#greeting-property)

---

# Stores

## HelloStore (class)

Feature store coordinating hello input and Effect execution.

**Signature**

```ts
export declare class HelloStore
```

Added in v1.0.0

### setName (method)

Update the name input.

**Signature**

```ts
setName(name: string): void
```

Added in v1.0.0

### run (method)

Execute the greet program and update remote data state.

**Signature**

```ts
async run(): Promise<void>
```

Added in v1.0.0

### name (property)

Current input value as a readonly signal.

**Signature**

```ts
readonly name: Signal<string>
```

Added in v1.0.0

### state (property)

Remote data state for the hello request.

**Signature**

```ts
readonly state: Signal<RemoteData<Cause.Cause<HelloApiError>, { readonly greeting: string & Brand<"Greeting">; }>>
```

Added in v1.0.0

### greeting (property)

Derived greeting when available.

**Signature**

```ts
readonly greeting: Signal<(string & Brand<"Greeting">) | null>
```

Added in v1.0.0
