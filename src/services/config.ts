import { Brand, Context, type LogLevel } from 'effect';

// todo: where should types like Port live?
export type Port = number & Brand.Brand<'Port'>;

export const makePort = Brand.nominal<Port>();

type ConfigServiceShape = {
  readonly port: Port;
  readonly logLevel: LogLevel.LogLevel;
};

export class ConfigService extends Context.Tag('ConfigService')<
  ConfigService,
  ConfigServiceShape
>() {}

