import { Effect } from 'effect';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import type { AppServices } from '../services';
import type { GraphQLContext } from './context';
import { makeSchema } from './schema';

// todo: extract so that schema is passed in here as a param
export const makeYoga: Effect.Effect<YogaServerInstance<GraphQLContext, Record<string, any>>, never, AppServices>
  = Effect.gen(function * () {
    const runtime = yield * Effect.runtime<AppServices>();
    return createYoga<GraphQLContext>({
      schema: makeSchema(), // todo: pass in resolvers here
      context: initial => ({ ...initial, runtime }),
    });
  });
