import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';
import type { AppServices } from '../services/app';

/**
 * the GraphQLContext contains a runtime for AppServices that can run any computation
 * whose requirements are a sub-union of AppServices.
 *
 * each handler can still demand only the services it needs, e.g.: Effect<A, E, DbService | ConfigService>
 *
 * categorically, there is a canonical inclusion R ↪ AppServices, and Effect is covariant in R
 */
export type GraphQLContext = YogaInitialContext & RuntimeForAppServicesShape;

type RuntimeForAppServicesShape = {
  readonly runtime: Runtime.Runtime<AppServices>;
};
