import { Schema } from 'effect';
import { query, resolver } from '@gqloom/core';
import { nameInputSchema } from '../../domain/nameInput';
import { helloResponseSchema } from '../../domain/helloResponse';
import { helloHandler } from '../../handlers/hello';
import { runEffect } from '../effect';

export const helloResolver = resolver({
  hello:
    query(Schema.standardSchemaV1(helloResponseSchema))
      .input(Schema.standardSchemaV1(nameInputSchema))
      .resolve(async args =>
        runEffect(
          helloHandler(args)
        )
      ),
});

