/**
 * GraphQL execution context bindings.
 * @since 1.0.0
 */
import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';
import type { AppServices } from '../services/interfaces/app';

/**
 * the GraphQLContext contains a runtime for AppServices that can run any computation
 * whose requirements are a sub-union of AppServices.
 *
 * each handler can still demand only the services it needs, e.g.: Effect<A, E, DbService | ConfigService>
 *
 * categorically, there is a canonical inclusion R ↪ AppServices, and Effect is covariant in R
 */
/**
 * GraphQL context enriched with an Effect runtime for `AppServices`.
 * @since 1.0.0
 */
export type GraphQLContext<R> = YogaInitialContext & RuntimeForAppServicesShape<R>;

type RuntimeForAppServicesShape<R> = {
  readonly runtime: Runtime.Runtime<R>;
};
