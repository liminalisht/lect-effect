
import { type Environment } from './app/environment';
import { type LogLevel } from './app/loglevel';
import { type Port } from './app/port';

export type AppConfig = {
  readonly port: Port;
  readonly logLevel: LogLevel;
  readonly environment: Environment;
}
