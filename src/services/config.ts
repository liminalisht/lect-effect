import { Context, Schema, type LogLevel } from 'effect';
import { type Port } from '../domain/port';

export const environmentSchema = Schema.Literal('dev', 'test', 'staging', 'prod');
export type Environment = Schema.Schema.Type<typeof environmentSchema>;

type ConfigServiceShape = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
  readonly environment: Environment;
};

export class ConfigService extends Context.Tag('ConfigService')<ConfigService, ConfigServiceShape>() {}

