/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import {
  Config, ConfigError, Effect, LogLevel, Schema,
} from 'effect';
import { type Environment, environmentSchema } from './interface/environment';
import { type Port, portSchema } from './interface/port';
import { type ConfigurationError } from '../errors';

const loadPort: Effect.Effect<Port, ConfigurationError> = Effect.gen(function * () {
  const port = yield * Config.number('APP_PORT')
    .pipe(Config.withDefault(4000))
    .pipe(Effect.map(number => portSchema.make(number)));
  return port;
});

const loadEnvironment: Effect.Effect<Environment, ConfigurationError> = Effect.gen(function * () {
  const environment = yield * Config.string('APP_ENV')
    .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
    .pipe(Effect.mapError(cause => ConfigError.InvalidData(
      ['APP_ENV'],
      cause instanceof Error ? cause.message : JSON.stringify(cause),
    )));
  return environment;
});

const loadLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigurationError> = Effect.gen(function * () {
  const logLevel = yield * Config.logLevel('APP_LOG_LEVEL')
    .pipe(Config.withDefault(LogLevel.Info));
  return logLevel;
});

export const appConfigServiceImplementation
  = Effect.gen(function * () {
      const port = yield * loadPort;
      const environment = yield * loadEnvironment;
      const logLevel = yield * loadLogLevel;
      const app = {
        port,
        logLevel,
        environment,
      };
      return app;
    });
