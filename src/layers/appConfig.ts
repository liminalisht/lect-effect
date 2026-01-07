import { Config as EffectConfig, ConfigError, Effect, Layer, LogLevel } from "effect"
import { AppConfig } from "../services/appConfig"

export const AppConfigLive: Layer.Layer<AppConfig, ConfigError.ConfigError> = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const port = yield* EffectConfig.number("PORT").pipe(EffectConfig.withDefault(4000))
    const logLevel = yield* EffectConfig.logLevel("LOGLEVEL").pipe(EffectConfig.withDefault(LogLevel.Info))
    return { port, logLevel }
  })
)
