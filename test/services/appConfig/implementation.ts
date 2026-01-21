import {
  Config, ConfigError, Effect, LogLevel, Schema,
} from 'effect';
// import { ConfigService } from '../../../src/services/config/interface.js';
import { environmentSchema } from '../../../src/services/appConfig/interface/environment.js';
import { portSchema } from '../../../src/services/appConfig/interface/port.js';
import { type AppConfig, AppConfigService } from '../../../src/services/appConfig/interface/index.js';

const loadPort = Effect.gen(function * () {
  const port = yield * Config.number('TEST_APP_PORT')
    .pipe(Config.withDefault(3000))
    .pipe(Effect.map(number => portSchema.make(number)));
  return port;
});

const loadEnvironment = Effect.gen(function * () {
  const environment = yield * Config.string('TEST_APP_ENV')
    .pipe(Effect.flatMap(env => Schema.decodeUnknown(environmentSchema)(env)))
    .pipe(Effect.mapError(cause => ConfigError.InvalidData(['APP_ENV'], cause instanceof Error ? cause.message : JSON.stringify(cause))));
  return environment;
});

const loadLogLevel = Effect.gen(function * () {
  const logLevel = yield * Config.logLevel('TEST_APP_LOG_LEVEL')
    .pipe(Config.withDefault(LogLevel.None));
  return logLevel;
});

// const loadMasterdataPgConfig = Effect.gen(function * () {
//   const url = yield * Config.redacted('TEST_MASTERDATA_PG_URL');
//   const poolMin = yield * Config.integer('TEST_MASTERDATA_PG_POOL_MIN').pipe(Config.withDefault(0));
//   const poolMax = yield * Config.integer('TEST_MASTERDATA_PG_POOL_MAX').pipe(Config.withDefault(10));
//   const poolIdleTimeoutMillis = yield * Config.integer('TEST_MASTERDATA_PG_IDLE_TIMEOUT_MS').pipe(Config.withDefault(30_000));

//   return {
//     url,
//     pool: {
//       min: poolMin,
//       max: poolMax,
//       idleTimeoutMillis: poolIdleTimeoutMillis,
//     },
//   };
// });

export const testAppConfigServiceImplementation: Effect.Effect<AppConfig, ConfigError.ConfigError>
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
