/**
 * GraphQL utilities for running Effect programs.
 * @since 1.0.0
 */
import { type Effect, Runtime } from 'effect';
import { useContext } from '@gqloom/core/context';
import type { GraphQLContext } from './context.js';
import { RuntimeMissingFromContextError } from './errors.js';

/**
 * Natural transformation `Effect<A, E, R> -> Promise<A>`.
 * E.g., pass any Effect whose requirements are a sub-union of `AppServices`.
 * @since 1.0.0
 * @category GraphQL Effect Utilities
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
