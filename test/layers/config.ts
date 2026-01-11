import { Layer, LogLevel } from 'effect';
import { portSchema } from '../../src/domain/port';
import { ConfigService } from '../../src/services/config';
import { Redacted } from 'effect';

// todo: move and consider reading from env
const testMasterdataPgConfig = {
  url: Redacted.make("postgres://user:password@localhost:5432/masterdata"), //todo: change
  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30_000,
  }
}

export const testConfigLayer = Layer.succeed(ConfigService, {
  port: portSchema.make(4000),
  logLevel: LogLevel.None,
  environment: 'test',
  masterdataPg: testMasterdataPgConfig,
});
