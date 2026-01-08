import { ConfigError, Layer } from "effect"
import { ConfigLayer } from "./config"
import { LoggerLayer } from "./logger"
import { type AppConfigService } from "../services"

export const AppLayer: Layer.Layer<AppConfigService, ConfigError.ConfigError, never> =
  Layer.merge(
    ConfigLayer,
    LoggerLayer.pipe(Layer.provide(ConfigLayer))
  );
