import { Effect, Schema } from 'effect';
import { GraphQLClientService } from '../../app/core/graphql/graphql-client';
  import { HelloApiService } from './hello.api.interface.js';
import { nameInputSchema } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema } from '@lect-effect/domain/hello/helloResponse';

const helloQuery = `
  query Hello($name: String) {
    greet(name: $name) {
      greeting
    }
  }
`;

export const helloApiLive = Effect.gen(function* () {
  const client = yield* GraphQLClientService;

  return HelloApiService.of({
    greet: (name: unknown) =>
      Effect.gen(function* () {
        const decoded = yield* Schema.decodeUnknown(nameInputSchema)({ name });
        const variables = { name: decoded.name ?? null };
        const response = yield* client.request(helloQuery, variables);
        const decodedResponse = yield* Schema.decodeUnknown(
          Schema.Struct({ greet: helloResponseSchema }),
        )(response);
        return decodedResponse.greet;
      }),
  });
});
