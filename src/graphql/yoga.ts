/**
 * GraphQL Yoga server setup.
 * @since 1.0.0
 */
import { Effect } from 'effect';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { type GraphQLSchema } from 'graphql';
import type { AppServices } from '../services/app';
import type { GraphQLContext } from './context';

// todo: extract so that schema is passed in here as a param
/**
 * Alias for the configured Yoga server instance.
 * @since 1.0.0
 */
export type Yoga = YogaServerInstance<GraphQLContext, Record<string, any>>;

/**
 * Constructs a Yoga server with the Effect runtime injected into context.
 * @since 1.0.0
 */
export const makeYoga
  = (schema: GraphQLSchema): Effect.Effect<Yoga, never, AppServices> => Effect.gen(function * () {
    const runtime = yield * Effect.runtime<AppServices>();
    return createYoga<GraphQLContext>({
      schema,
      context: initial => ({ ...initial, runtime }),
    });
  });
