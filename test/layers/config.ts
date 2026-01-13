import {
  Config, ConfigError, Effect, Layer, LogLevel, Schema,
} from 'effect';
import { ConfigService } from '../../src/services/config';
import { environmentSchema } from '../../src/domain/environment';
import { portSchema } from '../../src/domain/port';

const loadPort = Effect.gen(function * () {
  const port = yield * Config.number('TEST_APP_PORT')
    .pipe(Config.withDefault(3000))
    .pipe(Effect.map(number => portSchema.make(number)));
  return port;
});

const loadEnvironment = Effect.gen(function * () {
  const environment = yield * Config.string('TEST_APP_ENV')
    .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
    .pipe(Effect.mapError(cause => ConfigError.InvalidData(['APP_ENV'], String(cause))));
  return environment;
});

const loadLogLevel = Effect.gen(function * () {
  const logLevel = yield * Config.logLevel('TEST_APP_LOG_LEVEL')
    .pipe(Config.withDefault(LogLevel.None));
  return logLevel;
});

const loadMasterdataPgConfig = Effect.gen(function * () {
  const url = yield * Config.redacted('TEST_MASTERDATA_PG_URL');
  const poolMin = yield * Config.integer('TEST_MASTERDATA_PG_POOL_MIN').pipe(Config.withDefault(0));
  const poolMax = yield * Config.integer('TEST_MASTERDATA_PG_POOL_MAX').pipe(Config.withDefault(10));
  const poolIdleTimeoutMillis = yield * Config.integer('TEST_MASTERDATA_PG_IDLE_TIMEOUT_MS').pipe(Config.withDefault(30_000));

  return {
    url,
    pool: {
      min: poolMin,
      max: poolMax,
      idleTimeoutMillis: poolIdleTimeoutMillis,
    },
  };
});

export const testConfigLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
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
      const masterdataPg = yield * loadMasterdataPgConfig;
      return {
        app,
        masterdataPg,
      };
    }),
  );
