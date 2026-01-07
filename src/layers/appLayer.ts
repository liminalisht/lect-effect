import { ConfigError, Layer } from "effect"
import { AppConfigLive } from "./appConfig"
import { LoggerFromConfig } from "./logger"
import { type AppConfig } from "../services/"

export const AppLayer: Layer.Layer<AppConfig, ConfigError.ConfigError, never> =
  Layer.merge(AppConfigLive, LoggerFromConfig.pipe(Layer.provide(AppConfigLive)))
