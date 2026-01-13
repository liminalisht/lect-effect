import { type Redacted } from 'effect';

export type MasterdataDbConfig = {
  readonly url: Redacted.Redacted;
  readonly pool: {
    readonly min: number;
    readonly max: number;
    readonly idleTimeoutMillis: number;
  };
};
