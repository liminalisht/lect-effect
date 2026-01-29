/**
 * GraphQL client service wiring for frontend Effect programs.
 * @since 0.1.0
 */
import {Context, Effect, Layer} from 'effect';
import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type {Json} from '../json/json.js';
import {FrontendConfigService} from '../config/frontend-config.js';
import {
  DecodeError,
  type GraphQLClientError,
  GraphqlError,
  HttpError,
  TransportError,
} from './graphql-errors.js';

/**
 * Minimal GraphQL client interface returning Effect results.
 * @since 0.1.0
 * @category Service Interfaces
 */
export type GraphQLClient = {
  readonly request: <TData, TVariables extends Record<string, Json> | undefined = undefined>(
    doc: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
  ) => Effect.Effect<TData, GraphQLClientError>;
};

/**
 * Tag for locating the GraphQL client service in an Effect environment.
 * @since 0.1.0
 * @category Services
 */
export class GraphQLClientService extends Context.Tag('GraphQLClientService')<
  GraphQLClientService,
  GraphQLClient
>() {}

// todo: extract implementation
/**
 * Live GraphQL client layer backed by fetch.
 * @since 0.1.0
 * @category Layers
 */
export const GraphQLClientLive: Layer.Layer<
  GraphQLClientService,
  never,
  FrontendConfigService
> = Layer.effect(
  GraphQLClientService,
  Effect.gen(function * () {
    const { graphqlEndpoint } = yield * FrontendConfigService;

    return GraphQLClientService.of({
      request: <TData, TVariables extends Record<string, Json> | undefined = undefined>(
        doc: TypedDocumentNode<TData, TVariables>,
        variables?: TVariables,
      ) =>
        Effect.gen(function * () {
          const response = yield * Effect.tryPromise({
            try: async () => fetch(graphqlEndpoint, {
              method: 'POST',
              headers: {'content-type': 'application/json'},
              body: JSON.stringify({ query: print(doc), variables }),
            }),
            catch: cause => new TransportError({ cause }),
          });

          if (!response.ok) {
            const errorText = yield * Effect.tryPromise({
              try: async () => response.text(),
              catch: cause => new DecodeError({ cause }),
            });

            return yield * Effect.fail(new HttpError({
              status: response.status,
              body: errorText,
            }));
          }

          const json = yield * Effect.tryPromise({
            try: async () => response.json() as unknown,
            catch: cause => new DecodeError({ cause }),
          });

          if (typeof json !== 'object' || json === null) {
            return yield * Effect.fail(new DecodeError({
              cause: new Error('Response JSON was not an object'),
            }));
          }

          const {data, errors} = json as {data?: TData; errors?: unknown};

          if (Array.isArray(errors) && errors.length > 0) {
            return yield * Effect.fail(new GraphqlError({errors}));
          }

          if (data === undefined) {
            return yield * Effect.fail(new GraphqlError({errors: []}));
          }

          return data;
        }),
    });
  }),
);
