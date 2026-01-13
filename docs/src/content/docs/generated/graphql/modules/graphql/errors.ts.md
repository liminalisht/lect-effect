---
title: graphql/errors.ts
nav_order: 3
parent: Modules
---

## errors overview

GraphQL error types.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GraphqlError (type alias)](#graphqlerror-type-alias)
  - [RuntimeMissingFromContextError (class)](#runtimemissingfromcontexterror-class)
  - [ServerStartError (class)](#serverstarterror-class)

---

# utils

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
