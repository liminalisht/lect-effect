import {
  Config, ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../services/config';
import { environmentSchema } from '../domain/environment';
import { portSchema } from '../domain/port';

const loadPort = Effect.gen(function * () {
  const port = yield * Config.number('APP_PORT')
    .pipe(Config.withDefault(4000))
    .pipe(Effect.map(number => portSchema.make(number)));
  return port;
});

const loadEnvironment = Effect.gen(function * () {
  const environment = yield * Config.string('APP_ENV')
    .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
    .pipe(Effect.mapError(cause => ConfigError.InvalidData(['APP_ENV'], String(cause))));
  return environment;
});

const loadLogLevel = Effect.gen(function * () {
  const logLevel = yield * Config.logLevel('APP_LOG_LEVEL')
    .pipe(Config.withDefault(LogLevel.Info));
  return logLevel;
});

export const configLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.effect(
    ConfigService,
    Effect.gen(function * () {
      const port = yield * loadPort;
      const environment = yield * loadEnvironment;
      const logLevel = yield * loadLogLevel;
      return { port, logLevel, environment };
    }),
  );
