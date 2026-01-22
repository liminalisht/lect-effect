/**
 * GraphQL schema construction helpers.
 * @since 1.0.0
 */
import { weave } from '@gqloom/core';
import { asyncContextProvider } from '@gqloom/core/context';
import { EffectWeaver } from '@gqloom/effect';
import { type GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';
import { Effect } from 'effect';

/**
 * Resolver type accepted by schema weaving.
 * @since 1.0.0
 */
export type GraphQLResolver = Parameters<typeof weave>[2];

/**
 * Builds the GraphQL schema from registered resolvers.
 * @since 1.0.0
 */
export const makeSchema = (resolvers: readonly GraphQLResolver[]): GraphQLSchema =>
  weave(EffectWeaver, asyncContextProvider, ...resolvers);

/**
 * Logs a printable version of the schema for debugging.
 * @since 1.0.0
 */
export const logSchema = (schema: GraphQLSchema): Effect.Effect<void> => Effect.gen(function * () {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  yield * Effect.logDebug('generating graphql schema...');
  yield * Effect.logDebug(`\n${schemaString}`);
});
