/**
 * Live implementation of the hello API backed by GraphQL.
 * @since 1.0.0
 */
import { Effect, Schema } from 'effect';
import { nameInputSchema } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema } from '@lect-effect/domain/hello/helloResponse';
import { GraphQLClientService } from '../../app/core/graphql/graphql-client.js';
import { HelloApiService } from './hello.api.interface.js';

const helloQuery = `
  query Hello($name: String) {
    greet(name: $name) {
      greeting
    }
  }
`;

/**
 * Layer constructor yielding the live hello API service.
 * @since 1.0.0
 */
export const helloApiLive = Effect.gen(function * () {
  const client = yield * GraphQLClientService;

  return HelloApiService.of({
    greet: (name: unknown) =>
      Effect.gen(function * () {
        const decoded = yield * Schema.decodeUnknown(nameInputSchema)({ name });
        const variables = { name: decoded.name ?? null };
        const response = yield * client.request(helloQuery, variables);
        const decodedResponse = yield * Schema.decodeUnknown(Schema.Struct({ greet: helloResponseSchema }))(response);
        return decodedResponse.greet;
      }),
  });
});
