import { weave } from '@gqloom/core';
import { EffectWeaver } from '@gqloom/effect';
import { asyncContextProvider } from '@gqloom/core/context';
import { type GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';
import { Effect } from 'effect';
import { makeResolvers } from './resolvers';

// asyncContextProvider is enabled, so you can just read the GraphQLContext via useContext.
// todo: can't i make this a function that uses Effect?
export const schema = weave(EffectWeaver, asyncContextProvider, ...makeResolvers());

export const logSchema = (schema: GraphQLSchema): Effect.Effect<void> => Effect.gen(function * () {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  yield * Effect.logDebug('generating graphql schema...');
  yield * Effect.logDebug(`\n${schemaString}`);
});
