/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import {
  Config, ConfigError, Effect, LogLevel, Schema,
} from 'effect';
import { type ConfigurationError } from '../errors.js';
import { type Environment, environmentSchema } from './interface/environment.js';
import { type Port, portSchema } from './interface/port.js';
import { type AppConfig } from './interface/index.js';

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
