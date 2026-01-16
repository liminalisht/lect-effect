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
import { ConfigService } from '../config/interface';
import { MasterdataDbService } from './interface';
import { masterdataDbImplementation } from './implementation';
import { AppConfig, AppConfigService } from '../appConfig/interface';
import { MasterdataDbConfigService } from '../masterdataDbConfig/interface';

/**
 * Provides the live masterdata database client.
 * @since 1.0.0
 */
export const masterdataDbLayer: Layer.Layer<MasterdataDbService, SqlError | ConfigError, MasterdataDbConfigService>
  = Layer.unwrapEffect(Effect.gen(function * () {
      const masterdataDbConfig = yield * MasterdataDbConfigService;;

      // todo: hmm it almost seems like this should be constructed in our config layer?
      const pgConfig: Config.Config<PgClientConfig> = Config.succeed({
        url: masterdataDbConfig.url,
        minConnections: masterdataDbConfig.pool.min,
        maxConnections: masterdataDbConfig.pool.max,
        idleTimeout: masterdataDbConfig.pool.idleTimeoutMillis,
      }); // todo: what would be the point of putting satisfies PgClientConfig after the object?

      const sqlClientLayer: Layer.Layer<SqlClient.SqlClient | PgClient.PgClient, SqlError | ConfigError>
          = PgClient.layerConfig(pgConfig);

      const layer = Layer.effect(
        MasterdataDbService,
        masterdataDbImplementation,
      ).pipe(Layer.provide(sqlClientLayer));

      return layer;
    }));
