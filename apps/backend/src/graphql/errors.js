/**
 * GraphQL error types.
 * @since 1.0.0
 */
import { Data } from 'effect';
/**
 * Error raised when the server fails to start.
 * @since 1.0.0
 * @category GraphQL Errors
 */
export class ServerStartError extends Data.TaggedError('ServerStartError') {
}
/**
 * Error raised when GraphQLContext lacks the Effect runtime.
 * @since 1.0.0
 * @category GraphQL Errors
 */
export class RuntimeMissingFromContextError extends Data.TaggedError('RuntimeMissingFromContextError') {
}
