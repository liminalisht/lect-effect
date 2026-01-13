/**
 * GraphQL error types.
 * @since 1.0.0
 */
import { Data } from 'effect';

/**
 * Aggregate union of GraphQL errors.
 * @since 1.0.0
 */
export type GraphqlError = ServerStartError | RuntimeMissingFromContextError;

/**
 * Error raised when the server fails to start.
 * @since 1.0.0
 */
export class ServerStartError extends Data.TaggedError('ServerStartError')<ServerStartErrorShape> {}

type ServerStartErrorShape = {
  error: unknown;
};

/**
 * Error raised when GraphQLContext lacks the Effect runtime.
 * @since 1.0.0
 */
export class RuntimeMissingFromContextError extends Data.TaggedError('RuntimeMissingFromContextError')<RuntimeMissingFromContextErrorShape> {}

type RuntimeMissingFromContextErrorShape = {
  readonly message?: string;
};
