/**
 * GraphQL utilities for running Effect programs.
 * @since 1.0.0
 */
import { type Effect, Runtime } from 'effect';
import { useContext } from '@gqloom/core/context';
import type { AppServices } from '../services/app';
import type { GraphQLContext } from './context';
import { RuntimeMissingFromContextError } from './errors';

/**
 * Natural transformation `Effect<A, E, AppServices> -> Promise<A>`.
 * @since 1.0.0
 * Pass any Effect whose requirements are a sub-union of `AppServices`.
 */
export const runEffect = async <A, E, R>(eff: Effect.Effect<A, E, R>): Promise<A> => {
  const ctx = useContext<GraphQLContext<R>>();
  if (!ctx?.runtime) {
    throw new RuntimeMissingFromContextError({
      message: 'runtime missing from GraphQLContext',
    });
  }

  return Runtime.runPromise(ctx.runtime, eff);
};
