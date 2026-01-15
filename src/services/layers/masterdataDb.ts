/**
 * Masterdata database layer wiring.
 * @since 1.0.0
 */
import { Config, Effect, Layer } from 'effect';
import * as PgClient from '@effect/sql-pg/PgClient';
import type * as SqlClient from '@effect/sql/SqlClient';
import type { PgClientConfig } from '@effect/sql-pg/PgClient';
import { type ConfigError } from 'effect/ConfigError';
import { type SqlError } from '@effect/sql/SqlError';
import { ConfigService } from '../interfaces/config';
import { MasterdataDb } from '../interfaces/masterdataDb';
import { masterdataDbImplementation } from '../implementations/masterdataDb';

/**
 * Provides the live masterdata database client.
 * @since 1.0.0
 */
export const masterdataDbLayer: Layer.Layer<MasterdataDb, SqlError | ConfigError, ConfigService> = Layer.unwrapEffect(Effect.gen(function * () {
  const cfg = yield * ConfigService;

  // todo: hmm it almost seems like this should be constructed in our config layer?
  const pgConfig: Config.Config<PgClientConfig> = Config.succeed({
    url: cfg.masterdataPg.url,
    minConnections: cfg.masterdataPg.pool.min,
    maxConnections: cfg.masterdataPg.pool.max,
    idleTimeout: cfg.masterdataPg.pool.idleTimeoutMillis,
  }); // todo: what would be the point of putting satisfies PgClientConfig after the object?

  const sqlClientLayer: Layer.Layer<SqlClient.SqlClient | PgClient.PgClient, SqlError | ConfigError>
      = PgClient.layerConfig(pgConfig);

  const layer = Layer.effect(
    MasterdataDb,
    masterdataDbImplementation,
  ).pipe(Layer.provide(sqlClientLayer));

  return layer;
}));
