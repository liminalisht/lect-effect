/**
 * PG client configuration service contract.
 * @since 1.0.0
 */
import { Context } from 'effect';
import { type PgClientConfig } from '@effect/sql-pg/PgClient';

/**
 * Tag for accessing Postgres client configuration.
 * @since 1.0.0
 * @category Services
 */
export class PgClientConfigService extends Context.Tag('services/pgClientConfig')<PgClientConfigService, PgClientConfig>() {}
