import { Effect } from 'effect';
import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import type { AppEnv, ConfigService } from '../services';
import type { GraphQLContext } from './context';
import { schema } from './schema';

// todo: extract so that schema is passed in here as a param
export const makeYoga: Effect.Effect<YogaServerInstance<GraphQLContext, Record<string, any>>, never, ConfigService>
  = Effect.gen(function * () {
    const runtime = yield * Effect.runtime<AppEnv>();
    return createYoga<GraphQLContext>({
      schema,
      context: initial => ({ ...initial, runtime }),
    });
  });
