import { ConfigError, Effect, Layer, Logger } from "effect"
import { AppConfig } from "../services/appConfig"

export const LoggerFromConfig: Layer.Layer<never, ConfigError.ConfigError, AppConfig> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { logLevel } = yield* AppConfig
    return Logger.minimumLogLevel(logLevel)
  })
)
