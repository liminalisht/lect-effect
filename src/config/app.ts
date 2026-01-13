import { type LogLevel } from 'effect';
import { type Port } from '../domain/port';
import { type Environment } from '../domain/environment';

export type AppConfig = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
  readonly environment: Environment;
}
