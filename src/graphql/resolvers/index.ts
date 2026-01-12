import { helloResolver } from './hello';
import { productResolvers, productFieldResolvers } from './product';
import { itemResolvers, itemFieldResolvers } from './item';
import { masterdataMutations } from './mutations';

export const makeResolvers = () => [
  helloResolver,
  productResolvers,
  productFieldResolvers,
  itemResolvers,
  itemFieldResolvers,
  masterdataMutations,
];
