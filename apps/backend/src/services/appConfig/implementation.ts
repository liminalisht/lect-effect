/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import {
  Config, ConfigError, Effect, LogLevel, Schema,
} from 'effect';
import { type ConfigurationError } from '@lect-effect/services/errors';
import { type Environment, environmentSchema } from '@lect-effect/services/appConfig/interface/environment';
import { type Port, portSchema } from '@lect-effect/services/appConfig/interface/port';
import { type AppConfig } from '@lect-effect/services/appConfig';

const loadPort: Effect.Effect<Port, ConfigurationError> = Effect.gen(function * () {
  const port = yield * Config.number('BACKEND_PORT')
    .pipe(Config.withDefault(4000))
    .pipe(Effect.map(number => portSchema.make(number)));
  return port;
});

const loadEnvironment: Effect.Effect<Environment, ConfigurationError> = Effect.gen(function * () {
  const environment = yield * Config.string('BACKEND_ENV')
    .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
    .pipe(Effect.mapError(cause => ConfigError.InvalidData(
      ['BACKEND_ENV'],
      cause instanceof Error ? cause.message : JSON.stringify(cause),
    )));
  return environment;
});

const loadLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigurationError> = Effect.gen(function * () {
  const logLevel = yield * Config.logLevel('BACKEND_LOG_LEVEL')
    .pipe(Config.withDefault(LogLevel.Info));
  return logLevel;
});

/**
 * Loads application configuration from environment variables.
 * @since 1.0.0
 * @category Service Implementations
 */
export const appConfigServiceImplementation: Effect.Effect<AppConfig, ConfigError.ConfigError>
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
