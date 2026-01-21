import {Data} from 'effect';

export class TransportError extends Data.TaggedError('TransportError')<{readonly cause: unknown}> {}

export class HttpError extends Data.TaggedError('HttpError')<{
  readonly status: number;
  readonly body: unknown;
}> {}

export class GraphqlError extends Data.TaggedError('GraphqlError')<{
  readonly errors: readonly unknown[];
}> {}

export class DecodeError extends Data.TaggedError('DecodeError')<{readonly cause: unknown}> {}

export type GraphQLClientError =
  | TransportError
  | HttpError
  | GraphqlError
  | DecodeError;
