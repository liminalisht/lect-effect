/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import {
  Config, ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../interfaces/config';
import { type Environment, environmentSchema } from '../interfaces/config/app/environment';
import { type Port, portSchema } from '../interfaces/config/app/port';
import { type MasterdataDbConfig } from '../../config/masterdataDb';
import { type ConfigurationError } from '../../config/errors';

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

const loadMasterdataDbConfig: Effect.Effect<MasterdataDbConfig, ConfigurationError> = Effect.gen(function * () {
  const url = yield * Config.redacted('MASTERDATA_PG_URL');
  const poolMin = yield * Config.integer('MASTERDATA_PG_POOL_MIN').pipe(Config.withDefault(0));
  const poolMax = yield * Config.integer('MASTERDATA_PG_POOL_MAX').pipe(Config.withDefault(10));
  const poolIdleTimeoutMillis = yield * Config.integer('MASTERDATA_PG_IDLE_TIMEOUT_MS').pipe(Config.withDefault(30_000));

  return {
    url,
    pool: {
      min: poolMin,
      max: poolMax,
      idleTimeoutMillis: poolIdleTimeoutMillis,
    },
  };
});

/**
 * Provides configuration values to the environment.
 * @since 1.0.0
 */
export const configLayer: Layer.Layer<ConfigService, ConfigurationError>
  = Layer.effect(
    ConfigService,
    Effect.gen(function * () {
      const port = yield * loadPort;
      const environment = yield * loadEnvironment;
      const logLevel = yield * loadLogLevel;
      const app = {
        port,
        logLevel,
        environment,
      };
      const masterdataPg = yield * loadMasterdataDbConfig;
      return {
        app,
        masterdataPg,
      };
    }),
  );
