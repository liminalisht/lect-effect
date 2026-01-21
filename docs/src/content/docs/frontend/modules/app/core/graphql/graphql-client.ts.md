---
title: app/core/graphql/graphql-client.ts
nav_order: 8
parent: Modules
---

## graphql-client overview

Minimal GraphQL client built on Effect and fetch.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GraphQLClient (type alias)](#graphqlclient-type-alias)
  - [GraphQLClientLive](#graphqlclientlive)
  - [GraphQLClientTag](#graphqlclienttag)
  - [Json (type alias)](#json-type-alias)

---

# utils

## GraphQLClient (type alias)

GraphQL client interface used across the app.

**Signature**

```ts
export type GraphQLClient = {
  readonly request: (doc: string, variables?: unknown) => Effect.Effect<Json, GraphQLClientError>
}
```

Added in v1.0.0

## GraphQLClientLive

Live GraphQL client layer bound to the provided endpoint.

**Signature**

```ts
export declare const GraphQLClientLive: (endpoint: string) => Layer.Layer<GraphQLClient>
```

Added in v1.0.0

## GraphQLClientTag

Context tag for injecting a GraphQL client layer.

**Signature**

```ts
export declare const GraphQLClientTag: Context.Tag<GraphQLClient, GraphQLClient>
```

Added in v1.0.0

## Json (type alias)

Minimal JSON value shape for GraphQL responses.

**Signature**

```ts
export type Json = null | boolean | number | string | readonly Json[] | { [key: string]: Json }
```

Added in v1.0.0
