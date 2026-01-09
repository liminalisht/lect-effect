import {
  Config, type ConfigError, Effect, Layer, LogLevel,
} from 'effect';
import { ConfigService } from '../services/config';
import { portSchema } from '../domain/port';

export const configLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.effect(
    ConfigService,
    Effect.gen(function * () {
      const port = yield * Config.number('PORT')
        .pipe(Config.withDefault(4000))
        .pipe(Effect.map(number => portSchema.make(number))); //todo: this default then map is stupid
      const logLevel = yield * Config.logLevel('LOGLEVEL').pipe(Config.withDefault(LogLevel.Info));
      return { port, logLevel };
    }),
  );
