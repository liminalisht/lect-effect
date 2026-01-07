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

// todo: why isn't this called ConfigLayer, or ConfigLayerLive?
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

// todo: how come there's no Logger layer analogous to Config?

// todo: what a shitty name
const LoggerFromConfig = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config
    const { logLevel } = yield* config.getConfig
    return Logger.minimumLogLevel(logLevel)
  })
)

// todo: what a shitty name
// so, is this a Layer or what?
const LoggerConfigured = Layer.provide(LoggerFromConfig, ConfigLive)

// todo: what a shitty name. why not just App?
export const AppLayer = Layer.merge(ConfigLive, LoggerConfigured)

// what's the point of this ? am i going to manually thread this through to
// makeResolvers or something ??
export const appRuntime = ManagedRuntime.make(AppLayer)

// todo: there's gotta be a better way to write this, like using map or something
export const getPort: Effect.Effect<number, ConfigError.ConfigError, Config> =
  Effect.gen(function* () {
    const config = yield* Config
    const { port } = yield* config.getConfig
    return port
  })

// todo: there's gotta be a better way to write this, like using map or something
export const getLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigError.ConfigError, Config> =
  Effect.gen(function* () {
    const config = yield* Config
    const { logLevel } = yield* config.getConfig
    return logLevel
  })
