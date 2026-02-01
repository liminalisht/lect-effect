---
title: graphql/resolvers.ts
nav_order: 6
parent: Modules
---

## resolvers overview

Helpers for turning typed handlers into gqloom resolvers.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Handler Types](#graphql-handler-types)
  - [AnyHandler (type alias)](#anyhandler-type-alias)
- [GraphQL Resolver Types](#graphql-resolver-types)
  - [ResolverFromHandler (type alias)](#resolverfromhandler-type-alias)
- [GraphQL Resolver Utilities](#graphql-resolver-utilities)
  - [genericFieldResolver](#genericfieldresolver)
  - [genericMutationResolver](#genericmutationresolver)
  - [genericQueryResolver](#genericqueryresolver)
  - [handlerToResolver](#handlertoresolver)
  - [handlersToResolvers](#handlerstoresolvers)

---

# GraphQL Handler Types

## AnyHandler (type alias)

Union of supported handler shapes.

**Signature**

```ts
export type AnyHandler =
  | FieldHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
  | QueryHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
  | MutationHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
```

Added in v0.1.0

# GraphQL Resolver Types

## ResolverFromHandler (type alias)

Resolves the gqloom resolver type produced from a handler.

**Signature**

```ts
export type ResolverFromHandler<H> =
  H extends FieldHandler<infer P, infer I, infer O, infer E, infer R>
    ? ReturnType<typeof genericFieldResolver<P, I, O, E, R>>
    : H extends QueryHandler<infer I, infer O, infer E, infer R>
      ? ReturnType<typeof genericQueryResolver<I, O, E, R>>
      : H extends MutationHandler<infer I, infer O, infer E, infer R>
        ? ReturnType<typeof genericMutationResolver<I, O, E, R>>
        : never
```

Added in v0.1.0

# GraphQL Resolver Utilities

## genericFieldResolver

Builds a typed field resolver for gqloom.

**Signature**

```ts
export declare const genericFieldResolver: <
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>(
  config: FieldResolverConfig<P, I, O, E, R>
) => B<
  StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
  {
    [x: string]: xn<
      StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
      StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
      StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
      undefined
    >
  }
>
```

Added in v0.1.0

## genericMutationResolver

Builds a typed mutation resolver for gqloom.

**Signature**

```ts
export declare const genericMutationResolver: <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>(
  config: MutationResolverConfig<I, O, E, R>
) => R<{
  [x: string]: wn<
    StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
    StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>
  >
}>
```

Added in v0.1.0

## genericQueryResolver

Builds a typed query resolver for gqloom.

**Signature**

```ts
export declare const genericQueryResolver: <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>(
  config: QueryResolverConfig<I, O, E, R>
) => R<{
  [x: string]: En<
    StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>,
    StandardSchemaV1<any, any> & Schema.SchemaClass<any, any, never>
  >
}>
```

Added in v0.1.0

## handlerToResolver

Dispatches a handler to the appropriate resolver factory.

**Signature**

```ts
export declare const handlerToResolver: <H extends AnyHandler>(handler: H) => ResolverFromHandler<H>
```

Added in v0.1.0

## handlersToResolvers

Converts handler definitions into gqloom resolvers while preserving types.

**Signature**

```ts
export declare const handlersToResolvers: <HS extends readonly AnyHandler[]>(
  handlers: HS
) => { [K in keyof HS]: ResolverFromHandler<HS[K]> }
```

Added in v0.1.0
