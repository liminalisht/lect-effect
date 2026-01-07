import { Config as EffectConfig, ConfigError, Context, Effect, Layer, LogLevel, Logger } from "effect"

export class AppConfig extends Context.Tag("AppConfig")<
  AppConfig,
  {
    readonly port: number
    readonly logLevel: LogLevel.LogLevel
  }
>() {}

export type AppEnv = AppConfig

export const AppConfigLive: Layer.Layer<AppConfig, ConfigError.ConfigError> = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const port = yield* EffectConfig.number("PORT").pipe(EffectConfig.withDefault(4000))
    const logLevel = yield* EffectConfig.logLevel("LOGLEVEL").pipe(EffectConfig.withDefault(LogLevel.Info))
    return { port, logLevel }
  })
)

const LoggerFromConfig = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { logLevel } = yield* AppConfig
    return Logger.minimumLogLevel(logLevel)
  })
)

const LoggerConfigured: Layer.Layer<never, ConfigError.ConfigError, never> =
  Layer.provide(LoggerFromConfig, AppConfigLive)

export const AppLayer: Layer.Layer<AppEnv, ConfigError.ConfigError, never> =
  Layer.merge(AppConfigLive, LoggerConfigured)

// export const getPort: Effect.Effect<number, ConfigError.ConfigError, AppConfig> =
//   AppConfig.pipe(Effect.map((config) => config.port))

// export const getLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigError.ConfigError, AppConfig> =
//   AppConfig.pipe(Effect.map((config) => config.logLevel))
