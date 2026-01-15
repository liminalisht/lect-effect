/**
 * Field resolvers for the Product type.
 * @since 1.0.0
 */
import { field, mutation, query, resolver } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { runEffect } from './effect';
import { productSchema, type Product } from '../domain/product/product';
import { itemSchema } from '../domain/item/item';
import { itemsForProduct } from '../handlers/product';


export const genericFieldResolver = <
  P extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext,
  E,
  R
>
  ( key: string,
    descriptionString: string,
    parentSchema: P,
    outputSchema: O,
    handler: (parent: Schema.Schema.Type<P>) => Effect.Effect<Schema.Schema.Type<O>, E, R>
  ) => resolver.of(
  Schema.standardSchemaV1(parentSchema),
  {
    [key]:
      field(Schema.standardSchemaV1(outputSchema))
      .description(descriptionString)
      .resolve(async (parent) => runEffect(handler(parent))),
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

