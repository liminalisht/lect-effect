import { helloResolver } from './hello';
import { productResolvers, productFieldResolvers } from './product';
import { itemResolvers, itemFieldResolvers } from './item';
import { masterdataMutations } from './mutations';

// todo: reorg resolvers, or extract to functions based on lects?
export const makeResolvers = () => [
  helloResolver,
  productResolvers,
  productFieldResolvers,
  itemResolvers,
  itemFieldResolvers,
  masterdataMutations,
];
