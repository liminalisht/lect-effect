import { ConfigError, Layer } from "effect"
import { AppConfigLayer } from "./appConfig"
import { LoggerFromConfig } from "./logger"
import { type AppConfigService } from "../services/"

const LoggerLayer = LoggerFromConfig.pipe(Layer.provide(AppConfigLayer));

export const AppLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError, never> =
  Layer.merge(AppConfigLayer, LoggerLayer)
