import { field, mutation, query, resolver } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { runEffect } from './effect';
import { FieldHandler, MutationHandler, QueryHandler } from '../handlers/generic';

export type AnyHandler =
  | FieldHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
  | QueryHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>
  | MutationHandler<Schema.Schema.AnyNoContext, Schema.Schema.AnyNoContext, unknown, unknown>;

export type ResolverFromHandler<H> =
  H extends FieldHandler<infer P, infer I, infer O, infer E, infer R>
    ? ReturnType<typeof genericFieldResolver<P, I, O, E, R>>
    : H extends QueryHandler<infer I, infer O, infer E, infer R>
      ? ReturnType<typeof genericQueryResolver<I, O, E, R>>
      : H extends MutationHandler<infer I, infer O, infer E, infer R>
        ? ReturnType<typeof genericMutationResolver<I, O, E, R>>
        : never;


export const handlersToResolvers = <HS extends ReadonlyArray<AnyHandler>>(handlers: HS) =>
  handlers.map((handler) => handlerToResolver(handler)) as { [K in keyof HS]: ResolverFromHandler<HS[K]> };


export const handlerToResolver = <H extends AnyHandler>(handler: H): ResolverFromHandler<H> => {
  switch (handler.kind) {
    case 'field':
      return genericFieldResolver(
        handler.key,
        handler.descriptionString,
        handler.parentSchema,
        handler.inputSchema,
        handler.outputSchema,
        handler.handler,
      ) as ResolverFromHandler<H>;
    case 'query':
      return genericQueryResolver(
        handler.key,
        handler.descriptionString,
        handler.inputSchema,
        handler.outputSchema,
        handler.handler,
      ) as ResolverFromHandler<H>;
    case 'mutation':
      return genericMutationResolver(
        handler.key,
        handler.descriptionString,
        handler.inputSchema,
        handler.outputSchema,
        handler.handler,
      ) as ResolverFromHandler<H>;
  }
};

export const genericFieldResolver = <
  P extends Schema.Schema.AnyNoContext,
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>
  ( key: string,
    descriptionString: string,
    parentSchema: P,
    inputSchema: I,
    outputSchema: O,
    handler: (parent: Schema.Schema.Type<P>, input: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
  ) => resolver.of(
  Schema.standardSchemaV1(parentSchema),
  {
    [key]:
      field(Schema.standardSchemaV1(outputSchema))
      .description(descriptionString)
      .input(Schema.standardSchemaV1(inputSchema))
      .resolve(async (parent, input) => runEffect(handler(parent, input))),
  },
);

export const genericMutationResolver = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>
( key: string,
  descriptionStr: string,
  inputSchema: I,
  outputSchema: O,
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
) =>
  resolver({
    [key]:
      mutation(Schema.standardSchemaV1(outputSchema))
        .description(descriptionStr)
        .input(Schema.standardSchemaV1(inputSchema))
        .resolve(async (input: Schema.Schema.Type<I>) => runEffect(handler(input))),
  });

export const genericQueryResolver = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>
( key: string,
  descriptionStr: string,
  inputSchema: I,
  outputSchema: O,
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
) =>
  resolver({
    [key]:
      query(Schema.standardSchemaV1(outputSchema))
        .description(descriptionStr)
        .input(Schema.standardSchemaV1(inputSchema))
        .resolve(async (input: Schema.Schema.Type<I>) => runEffect(handler(input))),
  });
