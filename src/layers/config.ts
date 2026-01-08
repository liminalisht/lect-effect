import { Config, ConfigError, Effect, Layer, LogLevel } from "effect"
import { AppConfigService, Port } from "../services/config"

export const ConfigLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError>
  = Layer.effect(
    AppConfigService,
    Effect.gen(function* () {
      const port     = yield* Config.number("PORT").pipe(Config.withDefault(4000))
      const logLevel = yield* Config.logLevel("LOGLEVEL").pipe(Config.withDefault(LogLevel.Info))
      return { port: Port(port), logLevel }
    })
)
