import { Data } from 'effect';

export class ServerStartError extends Data.TaggedError('ServerStartError')<{
  error: unknown;
}> {}
