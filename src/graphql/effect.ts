import { type Effect, Runtime } from 'effect';
import { useContext } from '@gqloom/core/context';
import type { GraphQLContext } from './context';
import type { AppEnv } from '../services';

/**
 * Natural transformation: Effect<A,E,AppEnv> ~> Promise<A>
 *
 * Because Effect is usable with sub-requirements, you can pass an Effect whose
 * requirements are any sub-union of AppEnv.
 */
export const runEffect = async <A, E>(eff: Effect.Effect<A, E, AppEnv>): Promise<A> => {
  const ctx = useContext<GraphQLContext>();
  if (!ctx?.runtime) {
    // todo: shouldn't i return one of our errors from graphql/errors?
    throw new Error('Runtime missing from GraphQL context');
  }

  return Runtime.runPromise(ctx.runtime, eff);
};
