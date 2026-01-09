import { Layer, LogLevel } from 'effect';
import { portSchema } from '../../src/domain/port';
import { ConfigService } from '../../src/services/config';

export const testConfigLayer = Layer.succeed(ConfigService, {
  port: portSchema.make(4000),
  logLevel: LogLevel.None,
});
