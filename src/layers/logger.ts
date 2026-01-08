import { ConfigError, Effect, Layer, Logger } from "effect"
import { AppConfigService } from "../services/appConfig"

export const LoggerFromConfig: Layer.Layer<never, ConfigError.ConfigError, AppConfigService> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { logLevel } = yield* AppConfigService
    return Logger.minimumLogLevel(logLevel)
  })
)
