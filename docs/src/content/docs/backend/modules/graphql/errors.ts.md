---
title: graphql/errors.ts
nav_order: 5
parent: Modules
---

## errors overview

GraphQL error types.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Errors](#graphql-errors)
  - [GraphqlError (type alias)](#graphqlerror-type-alias)
  - [RuntimeMissingFromContextError (class)](#runtimemissingfromcontexterror-class)
  - [ServerStartError (class)](#serverstarterror-class)

---

# GraphQL Errors

## GraphqlError (type alias)

Aggregate union of GraphQL errors.

**Signature**

```ts
export type GraphqlError = ServerStartError | RuntimeMissingFromContextError
```

Added in v1.0.0

## RuntimeMissingFromContextError (class)

Error raised when GraphQLContext lacks the Effect runtime.

**Signature**

```ts
export declare class RuntimeMissingFromContextError
```

Added in v1.0.0

## ServerStartError (class)

Error raised when the server fails to start.

**Signature**

```ts
export declare class ServerStartError
```

Added in v1.0.0
