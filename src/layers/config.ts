import {
  Config, ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService, environmentSchema } from '../services/config';
import { portSchema } from '../domain/port';

export const configLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.effect(
    ConfigService,
    Effect.gen(function * () {
      const port = yield * Config.number('PORT')
        .pipe(Config.withDefault(4000))
        .pipe(Effect.map(number => portSchema.make(number)));
      const environment = yield * Config.string('APP_ENV')
        .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
        .pipe(Effect.mapError(cause => ConfigError.InvalidData(['APP_ENV'], String(cause))));
      const logLevel = yield * Config.logLevel('LOGLEVEL')
        .pipe(Config.withDefault(LogLevel.Info));
      return { port, logLevel, environment };
    }),
  );
