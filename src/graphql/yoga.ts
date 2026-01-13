import { Effect } from 'effect';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { type GraphQLSchema } from 'graphql';
import type { AppServices } from '../services/app';
import type { GraphQLContext } from './context';

// todo: extract so that schema is passed in here as a param
export type Yoga = YogaServerInstance<GraphQLContext, Record<string, any>>;

export const makeYoga
  = (schema: GraphQLSchema): Effect.Effect<Yoga, never, AppServices> => Effect.gen(function * () {
    const runtime = yield * Effect.runtime<AppServices>();
    return createYoga<GraphQLContext>({
      schema,
      context: initial => ({ ...initial, runtime }),
    });
  });
