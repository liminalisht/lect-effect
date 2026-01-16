import { describe, expect, it } from '@effect/vitest';
import { Effect, LogLevel } from 'effect';
import { AppConfigService } from '../../../src/services/appConfig/interface';
import { testAppLayer } from '../app';

describe('test app config log level', () => {
  it.effect('uses TEST_APP_LOG_LEVEL from the test config layer', () =>
    Effect.gen(function* () {
      const appConfig = yield* AppConfigService;
      expect(appConfig.logLevel).toEqual(LogLevel.Warning);
    }).pipe(Effect.provide(testAppLayer)));
});
