---
title: api/hello/hello.api.interface.ts
nav_order: 1
parent: Modules
---

## hello.api.interface overview

Hello API interface definitions and service tag.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Errors](#service-errors)
  - [HelloApiError (type alias)](#helloapierror-type-alias)
- [Service Interfaces](#service-interfaces)
  - [HelloApi (type alias)](#helloapi-type-alias)
- [Services](#services)
  - [HelloApiService (class)](#helloapiservice-class)

---

# Service Errors

## HelloApiError (type alias)

Error union produced by hello API operations.

**Signature**

```ts
export type HelloApiError = GraphQLClientError | ParseError
```

Added in v0.1.0

# Service Interfaces

## HelloApi (type alias)

Public surface of the hello API service.

**Signature**

```ts
export type HelloApi = {
  readonly greet: (input: NameInput) => Effect.Effect<HelloResponse, HelloApiError>
}
```

Added in v0.1.0

# Services

## HelloApiService (class)

Tag for locating the hello API service in an Effect environment.

**Signature**

```ts
export declare class HelloApiService
```

Added in v0.1.0
