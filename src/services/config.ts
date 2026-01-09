import { Context, type LogLevel } from 'effect';
import { Port } from '../domain/port';

type ConfigServiceShape = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
};

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

