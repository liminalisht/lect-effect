import { Data } from 'effect';

export type GraphqlError = ServerStartError | RuntimeMissingFromContextError;

/**
 * Server won't start
 */
export class ServerStartError extends Data.TaggedError('ServerStartError')<ServerStartErrorShape> {}

type ServerStartErrorShape = {
  error: unknown;
};

/**
 * GraphQLContext is missing the runtime that resolvers depend on
 */
export class RuntimeMissingFromContextError extends Data.TaggedError('RuntimeMissingFromContextError')<RuntimeMissingFromContextErrorShape> {}

type RuntimeMissingFromContextErrorShape = {
  readonly message?: string;
};
