import { resolver } from '@gqloom/core';
import { mutationsResolver } from '../mutations';
import { helloQueryMap, helloQueryResolver } from './hello';
import { productQueryResolvers, productQueryMap } from './product';
import { itemQueryResolvers, itemQueryMap } from './item';

// todo: reorg resolvers, or extract to functions based on lects?
export const queryResolver = resolver({
  ...helloQueryMap,
  ...itemQueryMap,
  ...productQueryMap,
});
