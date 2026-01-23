/**
 * Frontend configuration schemas and service tag.
 * @since 1.0.0
 */
import {
  Context, Either, LogLevel, Schema,
} from 'effect';
import type { ParseError } from 'effect/ParseResult';

/**
 * Log level identifiers accepted from raw config.
 * @since 1.0.0
 * @category Schemas
 */
export const LogLevelNameSchema = Schema.Literal(
  'All',
  'Fatal',
  'Error',
  'Warning',
  'Info',
  'Debug',
  'Trace',
  'None',
);

/**
 * Parsed log level literal type.
 * @since 1.0.0
 * @category Types
 */
export type LogLevelName = Schema.Schema.Type<typeof LogLevelNameSchema>;

/**
 * Schema for the raw frontend configuration provided by Angular DI.
 * @since 1.0.0
 * @category Schemas
 */
export const RawFrontendConfigSchema = Schema.Struct({
  graphqlEndpoint: Schema.String,
  logLevel: LogLevelNameSchema,
});

/**
 * Raw config shape prior to decoding.
 * @since 1.0.0
 * @category Types
 */
export type RawFrontendConfig = Schema.Schema.Type<typeof RawFrontendConfigSchema>;

/**
 * Decoded frontend configuration used by the Effect runtime.
 * @since 1.0.0
 * @category Service Interfaces
 */
export type FrontendConfig = Readonly<{
  graphqlEndpoint: string;
  logLevel: LogLevel.LogLevel;
}>;

const logLevelFromName = (name: LogLevelName): LogLevel.LogLevel => {
  switch (name) {
  case 'All': {return LogLevel.All;
  }

  case 'Fatal': {return LogLevel.Fatal;
  }

  case 'Error': {return LogLevel.Error;
  }

  case 'Warning': {return LogLevel.Warning;
  }

  case 'Info': {return LogLevel.Info;
  }

  case 'Debug': {return LogLevel.Debug;
  }

  case 'Trace': {return LogLevel.Trace;
  }

  case 'None': {return LogLevel.None;
  }
  }
};

/**
 * Decode and map a raw config object into the runtime frontend config.
 * @since 1.0.0
 * @category Decoders
 */
export const decodeFrontendConfigEither = (raw: unknown): Either.Either<FrontendConfig, ParseError> => {
  const decoded = Schema.decodeUnknownEither(RawFrontendConfigSchema)(raw);
  if (Either.isLeft(decoded)) {
    return Either.left(decoded.left);
  }

  return Either.right({
    graphqlEndpoint: decoded.right.graphqlEndpoint,
    logLevel: logLevelFromName(decoded.right.logLevel),
  });
};

/**
 * Tag for locating the decoded frontend configuration in an Effect environment.
 * @since 1.0.0
 * @category Services
 */
export class FrontendConfigService extends Context.Tag('FrontendConfigService')<
  FrontendConfigService,
  FrontendConfig
>() {}
