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

type AppConfig = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
  readonly environment: Environment;
}

type ConfigServiceShape = {
  readonly app: AppConfig;
  readonly masterdataPg: MasterdataPgConfig;
};

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

