/**
 * GraphQL mutation resolvers.
 * @since 1.0.0
 */
import { field, query, mutation } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { runEffect } from '../effect';
import { AppServices } from '../../services/app';

const genericMutation = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext
>(
  inputSchema: I,
  outputSchema: O,
  descriptionStr: string,
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, unknown, AppServices>
) =>
  mutation(Schema.standardSchemaV1(outputSchema))
    .description(descriptionStr)
    .input(Schema.standardSchemaV1(inputSchema))
    .resolve(async (args: Schema.Schema.Type<I>) => runEffect(handler(args)));

const genericQuery = <
  I extends Schema.Schema.AnyNoContext,
  O extends Schema.Schema.AnyNoContext
>(
  inputSchema: I,
  outputSchema: O,
  descriptionStr: string,
  handler: (args: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, unknown, AppServices>
) =>
  query(Schema.standardSchemaV1(outputSchema))
    .description(descriptionStr)
    .input(Schema.standardSchemaV1(inputSchema))
    .resolve(async (args: Schema.Schema.Type<I>) => runEffect(handler(args)));

const genericField = <
  O extends Schema.Schema.AnyNoContext
>(
  outputSchema: O,
  descriptionStr: string,
  handler: (args: Schema.Schema.Type<O>) => Effect.Effect<Schema.Schema.Type<O>, unknown, AppServices>,
  f: keyof typeof parent
) =>
  field(Schema.standardSchemaV1(outputSchema))
  .description(descriptionStr)
  .resolve(async (parent) => runEffect(handler(parent[f])));
