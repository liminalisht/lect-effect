---
title: app/core/graphql/graphql-errors.ts
nav_order: 19
parent: Modules
---

## graphql-errors overview

Error types for the GraphQL client.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Client Errors](#graphql-client-errors)
  - [DecodeError (class)](#decodeerror-class)
  - [GraphQLClientError (type alias)](#graphqlclienterror-type-alias)
  - [GraphqlError (class)](#graphqlerror-class)
  - [HttpError (class)](#httperror-class)
  - [TransportError (class)](#transporterror-class)

---

# GraphQL Client Errors

## DecodeError (class)

Failure to decode response content.

**Signature**

```ts
export declare class DecodeError
```

Added in v1.0.0

## GraphQLClientError (type alias)

Union of all GraphQL client error types.

**Signature**

```ts
export type GraphQLClientError = TransportError | HttpError | GraphqlError | DecodeError
```

Added in v1.0.0

## GraphqlError (class)

GraphQL-level error payloads.

**Signature**

```ts
export declare class GraphqlError
```

Added in v1.0.0

## HttpError (class)

HTTP error response returned by the GraphQL endpoint.

**Signature**

```ts
export declare class HttpError
```

Added in v1.0.0

## TransportError (class)

Transport-level failure when reaching the GraphQL endpoint.

**Signature**

```ts
export declare class TransportError
```

Added in v1.0.0
