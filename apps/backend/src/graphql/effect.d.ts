/**
 * GraphQL utilities for running Effect programs.
 * @since 1.0.0
 */
import { type Effect } from 'effect';
/**
 * Natural transformation `Effect<A, E, R> -> Promise<A>`.
 * E.g., pass any Effect whose requirements are a sub-union of `AppServices`.
 * @since 1.0.0
 * @category GraphQL Effect Utilities
 */
export declare const runEffect: <A, E, R>(eff: Effect.Effect<A, E, R>) => Promise<A>;
//# sourceMappingURL=effect.d.ts.map