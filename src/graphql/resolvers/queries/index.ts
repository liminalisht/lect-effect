/**
 * GraphQL query resolver aggregation.
 * @since 1.0.0
 */
import { resolver } from '@gqloom/core';
import { helloQueryMap } from './hello';
import { productQueryMap } from './product';
import { itemQueryMap } from './item';

// todo: reorg resolvers, or extract to functions based on lects?
/**
 * Resolver for all GraphQL queries.
 * @since 1.0.0
 */
export const queryResolver = resolver({
  ...helloQueryMap,
  ...itemQueryMap,
  ...productQueryMap,
});
