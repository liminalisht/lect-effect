---
title: app.ts
nav_order: 1
parent: Modules
---

## app overview

Application bootstrap wiring for GraphQL server startup.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [app](#app)
  - [getConfig](#getconfig)
  - [makeGraphQLSchema](#makegraphqlschema)
  - [makeYogaServer](#makeyogaserver)

---

# utils

## app

Top-level application Effect that wires configuration, schema, and server startup.

**Signature**

```ts
export declare const app: Effect.Effect<never, unknown, AppServices>
```

Added in v1.0.0

## getConfig

Loads configuration from the ConfigService.

**Signature**

```ts
export declare const getConfig: () => Effect.Effect<Config, never, ConfigService>
```

Added in v1.0.0

## makeGraphQLSchema

Builds and logs the GraphQL schema.

**Signature**

```ts
export declare const makeGraphQLSchema: (resolvers: readonly GraphQLResolver[]) => Effect.Effect<GraphQLSchema>
```

Added in v1.0.0

## makeYogaServer

Constructs the Yoga server instance with the provided schema.

**Signature**

```ts
export declare const makeYogaServer: (schema: GraphQLSchema) => Effect.Effect<Yoga<AppServices>, never, AppServices>
```

Added in v1.0.0
