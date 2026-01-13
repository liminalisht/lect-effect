import { Effect, Layer, Logger } from 'effect';
import { ConfigService } from '../services/config';

export const loggerLayer: Layer.Layer<never, never, ConfigService>
  = Layer.unwrapEffect(Effect.gen(function * () {
    const { app } = yield * ConfigService;
    return Logger.minimumLogLevel(app.logLevel);
  }));
