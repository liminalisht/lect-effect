/**
 * Master data database configuration contracts.
 * @since 1.0.0
 */
import { Context, type Redacted } from 'effect';

type Url = Redacted.Redacted;
type PoolMin = number;
type PoolMax = number;
type IdleTimeoutMillis = number;

/**
 * Configuration for the master data database connection and pool.
 * @since 1.0.0
 */
export type MasterdataDbConfig = {
  readonly url: Url;
  readonly pool: {
    readonly min: PoolMin;
    readonly max: PoolMax;
    readonly idleTimeoutMillis: IdleTimeoutMillis;
  };
};

export class MasterdataDbConfigService extends Context.Tag('services/masterdataDbConfig')<MasterdataDbConfigService, MasterdataDbConfig>() {}

