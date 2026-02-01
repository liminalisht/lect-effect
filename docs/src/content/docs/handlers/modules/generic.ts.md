---
title: generic.ts
nav_order: 1
parent: Modules
---

## generic overview

Shared handler shapes used to describe GraphQL operations in a schema-first way.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Resolver Types](#graphql-resolver-types)
  - [FieldHandler (type alias)](#fieldhandler-type-alias)
  - [MutationHandler (type alias)](#mutationhandler-type-alias)
  - [QueryHandler (type alias)](#queryhandler-type-alias)

---

# GraphQL Resolver Types

## FieldHandler (type alias)

Describes a field resolver operating on a parent type.

**Signature**

```ts
export type FieldHandler<
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
> = {
  kind: "field"
  parentSchema: P
  key: string
  descriptionString: string
  inputSchema: I
  outputSchema: O
  handler: (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
}
```

Added in v0.1.0

## MutationHandler (type alias)

Describes a mutation resolver for a root-level operation.

**Signature**

```ts
export type MutationHandler<I extends Schema.Schema.AnyNoContext, O extends Schema.Schema.AnyNoContext, E, R> = {
  kind: "mutation"
  key: string
  descriptionString: string
  inputSchema: I
  outputSchema: O
  handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
}
```

Added in v0.1.0

## QueryHandler (type alias)

Describes a query resolver for a root-level operation.

**Signature**

```ts
export type QueryHandler<I extends Schema.Schema.AnyNoContext, O extends Schema.Schema.AnyNoContext, E, R> = {
  kind: "query"
  key: string
  descriptionString: string
  inputSchema: I
  outputSchema: O
  handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
}
```

Added in v0.1.0
