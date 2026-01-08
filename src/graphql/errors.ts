import { Data } from 'effect';

export class ServerStartError extends Data.TaggedError('ServerStartError')<{
  error: unknown;
}> {}

/**
 * When GraphQLContext is missing the runtime (which resolvers need to run Effects against AppEnv Services)
 */
export class RuntimeMissingFromContextError extends Data.TaggedError('RuntimeMissingFromContextError')<{
  readonly message?: string;
}> {}
