import { Config, ConfigError, Effect, Layer, LogLevel, Logger, ManagedRuntime } from "effect"

export interface AppConfig {
  readonly port: number
  readonly logLevel: LogLevel.LogLevel
}

export class AppConfigTag extends Effect.Tag("AppConfig")<AppConfigTag, AppConfig>() {}

const appConfigConfig = Config.all([
  Config.number("PORT").pipe(Config.withDefault(4000)),
  Config.logLevel("LOGLEVEL").pipe(Config.withDefault(LogLevel.Info)),
]).pipe(Config.map(([port, logLevel]) => ({ port, logLevel })))

export const AppConfigLive: Layer.Layer<AppConfigTag, ConfigError.ConfigError, never> =
  Layer.effect(AppConfigTag, appConfigConfig)

const LoggerFromConfig = Layer.unwrapEffect(
  Effect.andThen(AppConfigTag, ({ logLevel }) => Logger.minimumLogLevel(logLevel)),
)

const LoggerConfigured = Layer.provide(LoggerFromConfig, AppConfigLive)

export const AppLayer = Layer.merge(AppConfigLive, LoggerConfigured)

export const appRuntime = ManagedRuntime.make(AppLayer)

export const getPort: Effect.Effect<number, ConfigError.ConfigError, AppConfigTag> =
  AppConfigTag.pipe(Effect.map((config) => config.port))

export const getLogLevel: Effect.Effect<LogLevel.LogLevel, ConfigError.ConfigError, AppConfigTag> =
  AppConfigTag.pipe(Effect.map((config) => config.logLevel))
