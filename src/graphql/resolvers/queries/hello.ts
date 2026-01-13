import { Schema } from 'effect';
import { query, resolver } from '@gqloom/core';
import { nameInputSchema } from '../../../domain/hello/nameInput';
import { helloResponseSchema } from '../../../domain/hello/helloResponse';
import { helloHandler } from '../../../handlers/hello';
import { runEffect } from '../../effect';

export const helloQueryMap = {
  hello: query(Schema.standardSchemaV1(helloResponseSchema))
    .input(Schema.standardSchemaV1(nameInputSchema))
    .resolve(async args => runEffect(helloHandler(args))),
};
export const helloQueryResolver = resolver(helloQueryMap);

