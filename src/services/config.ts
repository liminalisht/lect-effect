import { Context, type Redacted, type LogLevel } from 'effect';
import { type Port } from '../domain/port';
import { type Environment } from '../domain/environment';

// todo: move and rename
export type MasterdataPgConfig = {
  readonly url: Redacted.Redacted;
  readonly pool: {
    readonly min: number;
    readonly max: number;
    readonly idleTimeoutMillis: number;
  };
};

type ConfigServiceShape = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
  readonly environment: Environment;
  readonly masterdataPg: MasterdataPgConfig;
};

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

