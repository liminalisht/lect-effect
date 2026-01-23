import {
  Context, Either, LogLevel, Schema,
} from 'effect';
import type { ParseError } from 'effect/ParseResult';

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

export type LogLevelName = Schema.Schema.Type<typeof LogLevelNameSchema>;

export const RawFrontendConfigSchema = Schema.Struct({
  graphqlEndpoint: Schema.String,
  logLevel: LogLevelNameSchema,
});

export type RawFrontendConfig = Schema.Schema.Type<typeof RawFrontendConfigSchema>;

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

export class FrontendConfigService extends Context.Tag('FrontendConfigService')<
  FrontendConfigService,
  FrontendConfig
>() {}
