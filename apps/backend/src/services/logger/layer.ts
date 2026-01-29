/**
 * Logger configuration layer.
 * @since 0.1.0
 */
import { Effect, Layer, Logger } from 'effect';
import { AppConfigService } from '@lect-effect/services/appConfig';

// todo : change to depend on AppService
// todo: why is this not returning the service? i don't understand
/**
 * Provides a minimum log level based on configuration.
 * @since 0.1.0
 * @category Layers
 */
export const loggerLayer: Layer.Layer<never, never, AppConfigService>
  = Layer.unwrapEffect(Effect.gen(function * () {
    const appConfig = yield * AppConfigService;
    return Logger.minimumLogLevel(appConfig.logLevel);
  }));
