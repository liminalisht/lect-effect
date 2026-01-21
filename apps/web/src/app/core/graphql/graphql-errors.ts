/**
 * Error types for the GraphQL client.
 * @since 1.0.0
 */
import {Data} from 'effect';

/**
 * Transport-level failure when reaching the GraphQL endpoint.
 * @since 1.0.0
 */
export class TransportError extends Data.TaggedError('TransportError')<{readonly cause: unknown}> {}

/**
 * HTTP error response returned by the GraphQL endpoint.
 * @since 1.0.0
 */
export class HttpError extends Data.TaggedError('HttpError')<{
  readonly status: number;
  readonly body: unknown;
}> {}

/**
 * GraphQL-level error payloads.
 * @since 1.0.0
 */
export class GraphqlError extends Data.TaggedError('GraphqlError')<{
  readonly errors: readonly unknown[];
}> {}

/**
 * Failure to decode response content.
 * @since 1.0.0
 */
export class DecodeError extends Data.TaggedError('DecodeError')<{readonly cause: unknown}> {}

/**
 * Union of all GraphQL client error types.
 * @since 1.0.0
 */
export type GraphQLClientError =
	| TransportError
	| HttpError
	| GraphqlError
	| DecodeError;
