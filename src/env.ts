import { Config as EffectConfig, ConfigError, Context, Effect, Layer, LogLevel, Logger, ManagedRuntime } from "effect"

class Config extends Context.Tag("Config")<
  Config,
  {
    readonly getConfig: Effect.Effect<{
      readonly logLevel: LogLevel.LogLevel
      readonly port: number
    }>
  }
>() {}

export const ConfigLive: Layer.Layer<Config, ConfigError.ConfigError, never> =
  Layer.effect(
    Config,
    Effect.gen(function* () {
      const port = yield* EffectConfig.number("PORT").pipe(EffectConfig.withDefault(4000))
      const logLevel = yield* EffectConfig.logLevel("LOGLEVEL").pipe(EffectConfig.withDefault(LogLevel.Info))
      return {
        getConfig: Effect.succeed({ port, logLevel })
      }
    })
  )

const LoggerFromConfig = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config
    const { logLevel } = yield* config.getConfig
    return Logger.minimumLogLevel(logLevel)
  })
)

const LoggerConfigured = Layer.provide(LoggerFromConfig, ConfigLive)

export const AppLayer = Layer.merge(ConfigLive, LoggerConfigured)

export const appRuntime = ManagedRuntime.make(AppLayer)

export const getPort: Effect.Effect<number, ConfigError.ConfigError, Config> =
  Effect.gen(function* () {
    const config = yield* Config
    const { port } = yield* config.getConfig
    return port
  })

export const getLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigError.ConfigError, Config> =
  Effect.gen(function* () {
    const config = yield* Config
    const { logLevel } = yield* config.getConfig
    return logLevel
  })
