import {Context, Effect, Layer} from 'effect';
import {
  DecodeError, GraphqlError, HttpError, TransportError, type GraphQLClientError,
} from './graphql-errors.js';

export type Json =
	| null
	| boolean
	| number
	| string
	| readonly Json[]
	| {[key: string]: Json};

export type GraphQLClient = {
  readonly request: (doc: string, variables?: unknown) => Effect.Effect<Json, GraphQLClientError>;
};

export const GraphQLClientTag = Context.GenericTag<GraphQLClient>('GraphQLClient');

const toJson = (input: unknown): input is {readonly data?: Json; readonly errors?: unknown} =>
  typeof input === 'object' && input !== null;

export const GraphQLClientLive = (endpoint: string): Layer.Layer<GraphQLClient> =>
  Layer.succeed(GraphQLClientTag, {
    request: (doc, variables) =>
      Effect.gen(function * () {
        const response = yield * Effect.tryPromise({
          try: async () =>
            fetch(endpoint, {
              method: 'POST',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({query: doc, variables}),
            }),
          catch: cause => new TransportError({cause}),
        });

        if (!response.ok) {
          const body = yield * Effect.tryPromise({
            try: async () => response.text(),
            catch: cause => new DecodeError({cause}),
          });
          return yield * Effect.fail(new HttpError({status: response.status, body}));
        }

        const parsed = yield * Effect.tryPromise({
          try: async () => response.json() as Promise<unknown>,
          catch: cause => new DecodeError({cause}),
        });

        if (!toJson(parsed)) {
          return yield * Effect.fail(new DecodeError({cause: parsed}));
        }

        if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
          return yield * Effect.fail(new GraphqlError({errors: parsed.errors}));
        }

        if (parsed.data === undefined) {
          return yield * Effect.fail(new GraphqlError({errors: []}));
        }

        return parsed.data;
      }),
  });
