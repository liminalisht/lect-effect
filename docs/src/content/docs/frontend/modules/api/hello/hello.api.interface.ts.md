---
title: api/hello/hello.api.interface.ts
nav_order: 1
parent: Modules
---

## hello.api.interface overview

Hello API interface definitions and service tag.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [HelloApi (type alias)](#helloapi-type-alias)
  - [HelloApiError (type alias)](#helloapierror-type-alias)
  - [HelloApiService (class)](#helloapiservice-class)

---

# utils

## HelloApi (type alias)

Public surface of the hello API service.

**Signature**

```ts
export type HelloApi = {
  readonly greet: (name: unknown) => Effect.Effect<HelloResponse, HelloApiError>
}
```

Added in v1.0.0

## HelloApiError (type alias)

Error union produced by hello API operations.

**Signature**

```ts
export type HelloApiError = GraphQLClientError | ParseError
```

Added in v1.0.0

## HelloApiService (class)

Tag for locating the hello API service in an Effect environment.

**Signature**

```ts
export declare class HelloApiService
```

Added in v1.0.0
