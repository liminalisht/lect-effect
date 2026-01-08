import { type Effect, Runtime } from 'effect';
import { useContext } from '@gqloom/core/context';
import type { AppEnv } from '../services';
import type { GraphQLContext } from './context';
import { RuntimeMissingFromContextError } from './errors';

/**
 * natural transformation: Effect<A,E,AppEnv> ~> Promise<A>
 *
 * Effect is usable with sub-requirements:
 * pass an Effect whose requirements are any sub-union of `AppEnv`
 */
export const runEffect = async <A, E>(eff: Effect.Effect<A, E, AppEnv>): Promise<A> => {
  const ctx = useContext<GraphQLContext>();
  if (!ctx?.runtime) {
    throw new RuntimeMissingFromContextError({
      message: 'runtime missing from GraphQLContext',
    });
  }

  return Runtime.runPromise(ctx.runtime, eff);
};
