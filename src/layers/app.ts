import { ConfigError, Layer } from "effect"
import { ConfigLayer } from "./config"
import { LoggerLayer } from "./logger"
import { type ConfigService } from "../services"

export const AppLayer: Layer.Layer<ConfigService, ConfigError.ConfigError, never> =
  Layer.merge(
    ConfigLayer,
    LoggerLayer.pipe(Layer.provide(ConfigLayer))
  );
