import { type Redacted } from 'effect';

type Url = Redacted.Redacted;
type PoolMin = number;
type PoolMax = number;
type IdleTimeoutMillis = number;

export type MasterdataDbConfig = {
  readonly url: Url;
  readonly pool: {
    readonly min: PoolMin;
    readonly max: PoolMax;
    readonly idleTimeoutMillis: IdleTimeoutMillis;
  };
};
