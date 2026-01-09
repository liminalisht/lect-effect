import { Schema } from 'effect';
import { query, resolver } from '@gqloom/core';
import * as schemas from '../domain';
import * as handlers from '../handlers';
import { runEffect } from './effect';

// todo: can't i make this use Effect?
export const makeResolvers = () => {
  const helloResolver = resolver({
    hello:
      query(Schema.standardSchemaV1(schemas.helloResponseSchema))
        .input(Schema.standardSchemaV1(schemas.nameInputSchema))
        .resolve(async args =>
          runEffect(handlers.helloHandler(args))),
  });

  return [helloResolver];
};
