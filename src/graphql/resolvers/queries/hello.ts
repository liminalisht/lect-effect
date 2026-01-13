/**
 * GraphQL hello query resolvers.
 * @since 1.0.0
 */
import { Schema } from 'effect';
import { query, resolver } from '@gqloom/core';
import { nameInputSchema } from '../../../domain/hello/nameInput';
import { helloResponseSchema } from '../../../domain/hello/helloResponse';
import { helloHandler } from '../../../handlers/hello';
import { runEffect } from '../../effect';

/**
 * Map of hello queries.
 * @since 1.0.0
 */
export const helloQueryMap = {
  hello: query(Schema.standardSchemaV1(helloResponseSchema))
    .input(Schema.standardSchemaV1(nameInputSchema))
    .resolve(async args => runEffect(helloHandler(args))),
};
/**
 * Resolver for hello queries.
 * @since 1.0.0
 */
export const helloQueryResolver = resolver(helloQueryMap);

