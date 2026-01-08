import { query, resolver } from '@gqloom/core';
import * as handlers from '../domain/handlers';
import * as schemas from '../domain/schemas';
import { runEffect } from '../runEffect';

// todo: can't i make this use Effect?
export const makeResolvers = () => {
  const helloResolver = resolver({
    hello:
      query(schemas.HelloResponseStandard)
        .input(schemas.NameInputStandard)
        .resolve(async args =>
          runEffect(handlers.helloHandler(args))),
  });

  return [helloResolver];
};
