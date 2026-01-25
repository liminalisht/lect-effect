/**
 * Helpers for turning typed handlers into gqloom resolvers.
 * @since 1.0.0
 */
import {
  field, mutation, query, resolver,
} from '@gqloom/core';
import { type Effect, Schema } from 'effect';
import { type FieldHandler, type MutationHandler, type QueryHandler } from '@lect-effect/handlers/generic';
import { runEffect } from './effect.js';

/**
 * Union of supported handler shapes.
 * @since 1.0.0
 * @category GraphQL Handler Types
 */
export type AnyHandler =
	| FieldHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
	| QueryHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
	| MutationHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>;

/**
 * Resolves the gqloom resolver type produced from a handler.
 * @since 1.0.0
 * @category GraphQL Resolver Types
 */
export type ResolverFromHandler<H> =
  H extends FieldHandler<infer P, infer I, infer O, infer E, infer R>
    ? ReturnType<typeof genericFieldResolver<P, I, O, E, R>>
    : H extends QueryHandler<infer I, infer O, infer E, infer R>
      ? ReturnType<typeof genericQueryResolver<I, O, E, R>>
      : H extends MutationHandler<infer I, infer O, infer E, infer R>
        ? ReturnType<typeof genericMutationResolver<I, O, E, R>>
        : never;

/**
 * Converts handler definitions into gqloom resolvers while preserving types.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const handlersToResolvers = <HS extends readonly AnyHandler[]>(handlers: HS) =>
  handlers.map(handler => handlerToResolver(handler)) as { [K in keyof HS]: ResolverFromHandler<HS[K]> };

/**
 * Dispatches a handler to the appropriate resolver factory.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const handlerToResolver = <H extends AnyHandler>(handler: H): ResolverFromHandler<H> => {
  switch (handler.kind) {
  case 'field': {
    return genericFieldResolver({
      key: handler.key,
      descriptionString: handler.descriptionString,
      parentSchema: handler.parentSchema,
      inputSchema: handler.inputSchema,
      outputSchema: handler.outputSchema,
      handler: handler.handler,
    }) as ResolverFromHandler<H>;
  }

  case 'query': {
    return genericQueryResolver({
      key: handler.key,
      descriptionStr: handler.descriptionString,
      inputSchema: handler.inputSchema,
      outputSchema: handler.outputSchema,
      handler: handler.handler,
    }) as ResolverFromHandler<H>;
  }

  case 'mutation': {
    return genericMutationResolver({
      key: handler.key,
      descriptionStr: handler.descriptionString,
      inputSchema: handler.inputSchema,
      outputSchema: handler.outputSchema,
      handler: handler.handler,
    }) as ResolverFromHandler<H>;
  }
  }
};

type FieldResolverConfig<P, I, O, E, R> = {
  key: string;
  descriptionString: string;
  parentSchema: P;
  inputSchema: I;
  outputSchema: O;
  handler: (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

/**
 * Builds a typed field resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericFieldResolver = <
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
>(config: FieldResolverConfig<P, I, O, E, R>) => resolver.of(
    Schema.standardSchemaV1(config.parentSchema),
    {
      [config.key]:
    field(Schema.standardSchemaV1(config.outputSchema))
      .description(config.descriptionString)
      .input(Schema.standardSchemaV1(config.inputSchema))
      .resolve(async (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => runEffect(config.handler(parent, input))),
    },
  );

type MutationResolverConfig<I, O, E, R> = {
  key: string;
  descriptionStr: string;
  inputSchema: I;
  outputSchema: O;
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

/**
 * Builds a typed mutation resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericMutationResolver = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
>(config: MutationResolverConfig<I, O, E, R>) =>
    resolver({
      [config.key]:
    mutation(Schema.standardSchemaV1(config.outputSchema))
      .description(config.descriptionStr)
      .input(Schema.standardSchemaV1(config.inputSchema))
      .resolve(async (input: Schema.Schema.Type<I>) => runEffect(config.handler(input))),
    });

type QueryResolverConfig<I, O, E, R> = {
  key: string;
  descriptionStr: string;
  inputSchema: I;
  outputSchema: O;
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>;
};

/**
 * Builds a typed query resolver for gqloom.
 * @since 1.0.0
 * @category GraphQL Resolver Utilities
 */
export const genericQueryResolver = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R,
>(config: QueryResolverConfig<I, O, E, R>) =>
    resolver({
      [config.key]:
    query(Schema.standardSchemaV1(config.outputSchema))
      .description(config.descriptionStr)
      .input(Schema.standardSchemaV1(config.inputSchema))
      .resolve(async (input: Schema.Schema.Type<I>) => runEffect(config.handler(input))),
    });
