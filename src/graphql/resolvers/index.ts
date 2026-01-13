/**
 * Root GraphQL resolver assembly.
 * @since 1.0.0
 */
import { mutationsResolver } from './mutations';
import { queryResolver } from './queries';
import { productFieldResolvers } from './fields/product';
import { itemFieldResolvers } from './fields/item';

// todo: reorg resolvers, or extract to functions based on lects?
/**
 * Assembles query, mutation, and field resolvers for the schema.
 * @since 1.0.0
 */
export const makeResolvers = () => [
  queryResolver,
  mutationsResolver,
  // todo: extract field resolvers to own array and concat?
  itemFieldResolvers,
  productFieldResolvers,
];
