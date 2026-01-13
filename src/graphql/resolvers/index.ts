import { mutationsResolver } from './mutations';
import { queryResolver } from './queries';
import { productFieldResolvers } from './fields/product';
import { itemFieldResolvers } from './fields/item';

// todo: reorg resolvers, or extract to functions based on lects?
export const makeResolvers = () => [
  queryResolver,
  mutationsResolver,
  // todo: extract field resolvers to own array and concat?
  itemFieldResolvers,
  productFieldResolvers,
];
