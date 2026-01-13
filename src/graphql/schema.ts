/**
 * GraphQL schema construction helpers.
 * @since 1.0.0
 */
import { weave } from '@gqloom/core';
import { asyncContextProvider } from '@gqloom/core/context';
import { EffectWeaver } from '@gqloom/effect';
import { type GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';
import { Effect } from 'effect';
import { makeResolvers } from './resolvers';

// asyncContextProvider is enabled, so you can just read the GraphQLContext via useContext.
// todo: can't i make this a function that uses Effect?
// todo: make this a function called makeSchema that takes a list of resolvers...
/**
 * Builds the GraphQL schema from registered resolvers.
 * @since 1.0.0
 */
export const makeSchema = (): GraphQLSchema => weave(EffectWeaver, asyncContextProvider, ...makeResolvers());

/**
 * Logs a printable version of the schema for debugging.
 * @since 1.0.0
 */
export const logSchema = (schema: GraphQLSchema): Effect.Effect<void> => Effect.gen(function * () {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  yield * Effect.logDebug('generating graphql schema...');
  yield * Effect.logDebug(`\n${schemaString}`);
});
