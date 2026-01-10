import { Context, type LogLevel } from 'effect';
import { type Port } from '../domain/port';
import { type Environment } from '../domain/environment';

type ConfigServiceShape = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
  readonly environment: Environment;
};

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

