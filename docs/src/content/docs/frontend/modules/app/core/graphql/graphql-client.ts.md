---
title: app/core/graphql/graphql-client.ts
nav_order: 18
parent: Modules
---

## graphql-client overview

GraphQL client service wiring for frontend Effect programs.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Layers](#layers)
  - [GraphQLClientLive](#graphqlclientlive)
- [Service Interfaces](#service-interfaces)
  - [GraphQLClient (type alias)](#graphqlclient-type-alias)
- [Services](#services)
  - [GraphQLClientService (class)](#graphqlclientservice-class)

---

# Layers

## GraphQLClientLive

Live GraphQL client layer backed by fetch.

**Signature**

```ts
export declare const GraphQLClientLive: Layer.Layer<GraphQLClientService, never, FrontendConfigService>
```

Added in v1.0.0

# Service Interfaces

## GraphQLClient (type alias)

Minimal GraphQL client interface returning Effect results.

**Signature**

```ts
export type GraphQLClient = {
  readonly request: <A extends Record<string, Json>>(
    doc: string,
    variables?: Record<string, Json>
  ) => Effect.Effect<A, GraphQLClientError>
}
```

Added in v1.0.0

# Services

## GraphQLClientService (class)

Tag for locating the GraphQL client service in an Effect environment.

**Signature**

```ts
export declare class GraphQLClientService
```

Added in v1.0.0
