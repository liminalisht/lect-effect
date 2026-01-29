/**
 * GraphQL execution context bindings.
 * @since 0.1.0
 */
import type { Runtime } from 'effect';
import type { YogaInitialContext } from 'graphql-yoga';

/**
 * GraphQL context enriched with an Effect runtime for `AppServices`.
 * @since 0.1.0
 * @category GraphQL Context
 */
export type GraphQLContext<R> = YogaInitialContext & RuntimeForServiceRequirements<R>;

type RuntimeForServiceRequirements<R> = {
  readonly runtime: Runtime.Runtime<R>;
};
