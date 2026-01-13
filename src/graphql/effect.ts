import { type Effect, Runtime } from 'effect';
import { useContext } from '@gqloom/core/context';
import type { AppServices } from '../services/app';
import type { GraphQLContext } from './context';
import { RuntimeMissingFromContextError } from './errors';

/**
 * Effect<A, E, AppServices> ~> Promise<A> natural transformation
 * pass any Effect whose requirements are a sub-union of `AppServices`
 */
export const runEffect = async <A, E>(eff: Effect.Effect<A, E, AppServices>): Promise<A> => {
  const ctx = useContext<GraphQLContext>();
  if (!ctx?.runtime) {
    throw new RuntimeMissingFromContextError({
      message: 'runtime missing from GraphQLContext',
    });
  }

  return Runtime.runPromise(ctx.runtime, eff);
};
