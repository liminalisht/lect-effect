/**
 * GraphQL execution context bindings.
 * @since 1.0.0
 */
import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';

/**
 * GraphQL context enriched with an Effect runtime for `AppServices`.
 * @since 1.0.0
 * @category GraphQL Context
 */
export type GraphQLContext<R> = YogaInitialContext & RuntimeForServiceRequirements<R>;

type RuntimeForServiceRequirements<R> = {
  readonly runtime: Runtime.Runtime<R>;
};
