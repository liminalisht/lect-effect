import { Schema } from 'effect';
import { query, resolver } from '@gqloom/core';
import * as domain from '../../domain';
import * as handlers from '../../handlers';
import { runEffect } from '../effect';

export const helloResolver = resolver({
  hello:
    query(Schema.standardSchemaV1(domain.helloResponseSchema))
      .input(Schema.standardSchemaV1(domain.nameInputSchema))
      .resolve(async args =>
        runEffect(handlers.helloHandler(args))),
});

