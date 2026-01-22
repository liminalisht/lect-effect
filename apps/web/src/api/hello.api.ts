/**
 * Implementation requirements (these are the “laws”):

The module must not import Angular.

It must:

validate variables via shared schema nameInputSchema,

call GraphQL with GraphQLClientTag.request(...),

validate the returned data via a schema,

return HelloResponse (not the whole GraphQL envelope).

Because GraphQLClient.request returns the GraphQL data JSON (not { data, errors }), you must decode the shape { greet: HelloResponse } and then project .greet. This matches the backend test shape (json.data.greet.greeting)

 */
import { Effect, Schema } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import { nameInputSchema, type NameInput } from '@lect-effect/domain/hello/nameInput';
import { helloResponseSchema, type HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import { GraphQLClientTag, type GraphQLClient } from '../app/core/graphql/graphql-client.js';
import type { GraphQLClientError } from '../app/core/graphql/graphql-errors.js';

export type HelloApiError = GraphQLClientError | ParseError;

// Must match backend schema/tests:
const HelloQuery = /* GraphQL */ `
  query Hello($name: String) {
    greet(name: $name) { greeting }
  }
`;

// GraphQLClient.request returns the `data` payload, so we decode `{ greet: ... }`.
const HelloDataSchema = Schema.Struct({
  greet: helloResponseSchema,
});

const normalizeNameVar = (input: NameInput): {name: string | null} => ({
  // JSON cannot encode `undefined` → normalize to null
  name: input.name ?? null,
});

export const greet = (input: unknown): Effect.Effect<HelloResponse, HelloApiError, GraphQLClient> =>
  Effect.gen(function * () {
    // normalize empty string → null (optional but recommended)
    const variables = yield * Schema.decodeUnknown(nameInputSchema)(input).pipe(Effect.map(i => {
      const trimmed = (i.name ?? '').trim();
      const normalized: NameInput = { name: trimmed === '' ? null : trimmed };
      return normalizeNameVar(normalized);
    }));

    const client = yield * GraphQLClientTag;

    const dataJson = yield * client.request(HelloQuery, variables);

    const decoded = yield * Schema.decodeUnknown(HelloDataSchema)(dataJson);
    return decoded.greet;
  });
