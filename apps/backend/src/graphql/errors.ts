/**
 * GraphQL error types.
 * @since 0.1.0
 */
import { Data } from 'effect';

/**
 * Aggregate union of GraphQL errors.
 * @since 0.1.0
 * @category GraphQL Errors
 */
export type GraphqlError = ServerStartError | RuntimeMissingFromContextError;

/**
 * Error raised when the server fails to start.
 * @since 0.1.0
 * @category GraphQL Errors
 */
export class ServerStartError extends Data.TaggedError('ServerStartError')<ServerStartErrorShape> {}

type ServerStartErrorShape = {
  error: unknown;
};

/**
 * Error raised when GraphQLContext lacks the Effect runtime.
 * @since 0.1.0
 * @category GraphQL Errors
 */
export class RuntimeMissingFromContextError extends Data.TaggedError('RuntimeMissingFromContextError')<RuntimeMissingFromContextErrorShape> {}

type RuntimeMissingFromContextErrorShape = {
  readonly message?: string;
};
