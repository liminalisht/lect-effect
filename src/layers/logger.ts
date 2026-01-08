import { Effect, Layer, Logger } from "effect"
import { AppConfigService } from "../services/config"

export const LoggerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { logLevel } = yield* AppConfigService
    return Logger.minimumLogLevel(logLevel)
  })
);
