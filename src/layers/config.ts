import {
  Config, type ConfigError, Effect, Layer, LogLevel,
} from 'effect';
import { ConfigService, makePort } from '../services/config';

export const ConfigLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.effect(
    ConfigService,
    Effect.gen(function * () {
      const port = yield * Config.number('PORT')
        .pipe(Config.withDefault(4000))
        .pipe(Effect.map(makePort));
      const logLevel = yield * Config.logLevel('LOGLEVEL').pipe(Config.withDefault(LogLevel.Info));
      return { port, logLevel };
    }),
  );
