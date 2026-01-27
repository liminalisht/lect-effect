/**
 * Live implementation of the hello API backed by GraphQL.
 * @since 1.0.0
 */
import { Effect, Schema } from 'effect';
import { type NameInput, nameInputSchema } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema } from '@lect-effect/domain/hello/helloResponse';
import { GraphQLClientService } from '../../app/core/graphql/graphql-client.js';
import { HelloDocument } from '../../graphql/generated/graphql.js';
import { HelloApiService } from './hello.api.interface.js';

const decodeResponse = Schema.decodeUnknown(Schema.Struct({greet: helloResponseSchema}));

/**
 * Layer constructor yielding the live hello API service.
 * @since 1.0.0
 * @category Service Implementations
 */
export const helloApiLive = Effect.gen(function * () {
  const client = yield * GraphQLClientService;

  return HelloApiService.of({
    greet: (input: NameInput) =>
      Effect.gen(function * () {
        const variables = {name: input.name ?? null};
        const response = yield * client.request(HelloDocument, variables);
        const {greet} = yield * decodeResponse(response);
        return greet;
      }),
  });
});
