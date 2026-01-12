import { helloResolver } from './hello';
import { productResolvers } from './product';

export const makeResolvers = () =>
  [ helloResolver,
    productResolvers,

  ];
