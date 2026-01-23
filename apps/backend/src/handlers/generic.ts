/**
 * Shared handler shapes used to describe GraphQL operations in a schema-first way.
 * @since 1.0.0
 */
import { type Effect, type Schema } from 'effect';

/**
 * Describes a field resolver operating on a parent type.
 * @since 1.0.0
 * @category GraphQL Resolver Types
 */
export type FieldHandler<
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'field';
    parentSchema: P;
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

/**
 * Describes a query resolver for a root-level operation.
 * @since 1.0.0
 * @category GraphQL Resolver Types
 */
export type QueryHandler<
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'query';
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

/**
 * Describes a mutation resolver for a root-level operation.
 * @since 1.0.0
 * @category GraphQL Resolver Types
 */
export type MutationHandler<
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
> = {
    kind: 'mutation';
    key: string;
    descriptionString: string;
    inputSchema: I;
    outputSchema: O;
    handler: (input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};
