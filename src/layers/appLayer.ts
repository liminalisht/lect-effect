import { ConfigError, Layer } from "effect"
import { AppConfigLive } from "./appConfig"
import { LoggerFromConfig } from "./logger"
import { AppEnv } from "../services/appConfig"

export const AppLayer: Layer.Layer<AppEnv, ConfigError.ConfigError, never> =
  Layer.merge(AppConfigLive, LoggerFromConfig.pipe(Layer.provide(AppConfigLive)))
