/**
 * Logger configuration layer.
 * @since 1.0.0
 */
import { Effect, Layer, Logger } from 'effect';
import { ConfigService } from '../services/config';

/**
 * Provides a minimum log level based on configuration.
 * @since 1.0.0
 */
export const loggerLayer: Layer.Layer<never, never, ConfigService>
  = Layer.unwrapEffect(Effect.gen(function * () {
    const { app } = yield * ConfigService;
    return Logger.minimumLogLevel(app.logLevel);
  }));
