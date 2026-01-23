/**
 * Hello API interface definitions and service tag.
 * @since 1.0.0
 */
import { Context, type Effect } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import type { HelloResponse } from '@lect-effect/domain/hello/helloResponse';
import type { GraphQLClientError } from '../../app/core/graphql/graphql-errors';

/**
 * Error union produced by hello API operations.
 * @since 1.0.0
 */
export type HelloApiError = GraphQLClientError | ParseError;

/**
 * Public surface of the hello API service.
 * @since 1.0.0
 */
export type HelloApi = {
  readonly greet: (name: unknown) => Effect.Effect<HelloResponse, HelloApiError>;
};

/**
 * Tag for locating the hello API service in an Effect environment.
 * @since 1.0.0
 */
export class HelloApiService extends Context.Tag('HelloApiService')<
  HelloApiService,
  HelloApi
>() {}
