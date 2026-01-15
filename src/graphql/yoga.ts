/**
 * GraphQL Yoga server setup.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { type GraphQLSchema } from 'graphql';
import type { GraphQLContext } from './context';

// todo: extract so that schema is passed in here as a param
/**
 * Alias for the configured Yoga server instance.
 * @since 1.0.0
 */
export type Yoga<R> = YogaServerInstance<GraphQLContext<R>, Record<string, any>>;

/**
 * Constructs a Yoga server with the Effect runtime injected into context.
 * @since 1.0.0
 */
export const makeYoga
  = <R>(schema: GraphQLSchema): Effect.Effect<Yoga<R>, never, R> => Effect.gen(function * () {
    const runtime = yield * Effect.runtime<R>();
    return createYoga<GraphQLContext<R>>({
      schema,
      context: initial => ({ ...initial, runtime }),
    });
  });
