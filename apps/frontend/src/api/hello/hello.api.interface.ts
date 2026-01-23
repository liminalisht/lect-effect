import { Context, Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { GraphQLClientError } from '../../app/core/graphql/graphql-errors';
import type { HelloResponse } from '@lect-effect/domain/hello/helloResponse';

export type HelloApiError = GraphQLClientError | ParseError;

export type HelloApi = {
  readonly greet: (name: unknown) => Effect.Effect<HelloResponse, HelloApiError>;
};

export class HelloApiService extends Context.Tag('HelloApiService')<
  HelloApiService,
  HelloApi
>() {}
