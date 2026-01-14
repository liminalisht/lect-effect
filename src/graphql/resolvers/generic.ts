/**
 * GraphQL mutation resolvers.
 * @since 1.0.0
 */
import { field, query, mutation } from '@gqloom/core';
import { Effect, Schema } from 'effect';
import { runEffect } from '../effect';
import { AppServices } from '../../services/app';

export const genericMutation = <
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

export const genericQuery = <
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

export const genericField = <
  O extends Schema.Schema.AnyNoContext
>(
  outputSchema: O,
  descriptionStr: string,
  handler: (args: Schema.Schema.Type<O>) => Effect.Effect<Schema.Schema.Type<O>, unknown, AppServices>,
) =>
  field(Schema.standardSchemaV1(outputSchema))
  .description(descriptionStr)
  .resolve(async (parent) => runEffect(handler(parent)));


export type HandlerWithMeta<I extends Schema.Schema.Any, O extends Schema.Schema.Any, R, E> =
  ((arg: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>) & {
    meta: { input: I; output: O; description: string; services: readonly unknown[] };
  };

export function withMeta<
  I extends Schema.Schema.Any,
  O extends Schema.Schema.Any,
  R = never,
  E = unknown
>(
  fn: (arg: Schema.Schema.Type<I>) => Effect.Effect<Schema.Schema.Type<O>, E, R>,
  meta: { input: I; output: O; description: string; services: readonly unknown[] },
): HandlerWithMeta<I, O, R, E>;

export function withMeta<
  O extends Schema.Schema.Any,
  R = never,
  E = unknown
>(
  fn: () => Effect.Effect<Schema.Schema.Type<O>, E, R>,
  meta: { input: typeof Schema.Void; output: O; description: string; services: readonly unknown[] },
): (() => Effect.Effect<Schema.Schema.Type<O>, E, R>) & {
  meta: { input: typeof Schema.Void; output: O; description: string; services: readonly unknown[] };
};

export function withMeta(fn: any, meta: any) {
  return Object.assign(fn, { meta });
}
