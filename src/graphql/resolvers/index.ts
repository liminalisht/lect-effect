// import { Schema } from 'effect';
// import { query, resolver } from '@gqloom/core';
// import * as domain from '../../domain';
// import * as handlers from '../../handlers';
// import { runEffect } from '../effect';

// // todo: can't i make this use Effect?
// export const makeResolvers = () => {
//   const helloResolver = resolver({
//     hello:
//       query(Schema.standardSchemaV1(domain.helloResponseSchema))
//         .input(Schema.standardSchemaV1(domain.nameInputSchema))
//         .resolve(async args =>
//           runEffect(handlers.helloHandler(args))),
//   });

//   return [helloResolver];
// };
import { helloResolver } from "./hello";

export const makeResolvers = () => {
  return [helloResolver];
}
