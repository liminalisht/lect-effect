
import { type Environment } from './app/environment';
import { type ConfiguredLogLevel } from './app/loglevel';
import { type Port } from './app/port';

export type AppConfig = {
  readonly port: Port;
  readonly logLevel: ConfiguredLogLevel;
  readonly environment: Environment;
};
