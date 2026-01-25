/**
 * Layer for loading and providing application configuration.
 * @since 1.0.0
 */
import {
  Config, type ConfigError, Effect,
} from 'effect';
import { type ConfigurationError } from '@lect-effect/services/errors';
import { type MasterdataDbConfig } from '@lect-effect/services/masterdataDbConfig';

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
 * @category Service Implementations
 */
export const masterdataDbConfigServiceImplementation: Effect.Effect<MasterdataDbConfig, ConfigError.ConfigError> = loadMasterdataDbConfig;
