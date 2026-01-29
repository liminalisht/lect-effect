/**
 * Logging layer wiring for the frontend runtime.
 * @since 0.1.0
 */
import { Effect, Layer, Logger } from 'effect';
import { FrontendConfigService } from '../config/frontend-config.js';

const program: Effect.Effect<Layer.Layer<never>, never, FrontendConfigService> = Effect.gen(function * () {
  const cfg = yield * FrontendConfigService;
  return Logger.minimumLogLevel(cfg.logLevel);
});

/**
 * Layer that configures the Effect logger based on the frontend config.
 * @since 0.1.0
 * @category Layers
 */
export const FrontendLoggerLayer: Layer.Layer<never, never, FrontendConfigService> = Layer.unwrapEffect(program);
