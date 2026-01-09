import { Effect, Layer, Logger } from 'effect';
import { ConfigService } from '../services/config';

export const loggerLayer: Layer.Layer<never, never, ConfigService>
= Layer.unwrapEffect(Effect.gen(function * () {
  const { logLevel } = yield * ConfigService;
  return Logger.minimumLogLevel(logLevel);
}));
