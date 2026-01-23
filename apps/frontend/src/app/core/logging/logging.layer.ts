import { Effect, Layer, Logger } from 'effect';
import { FrontendConfigService } from '../config/frontend-config.js';

//todo: rename
const program: Effect.Effect<Layer.Layer<never, never, never>, never, FrontendConfigService> = Effect.gen(function* () {
  const cfg = yield* FrontendConfigService;
  return Logger.minimumLogLevel(cfg.logLevel);
});

export const FrontendLoggerLayer: Layer.Layer<never, never, FrontendConfigService> = Layer.unwrapEffect(program);
