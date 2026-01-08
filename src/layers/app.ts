import { type ConfigError, Layer } from 'effect';
import { type ConfigService } from '../services';
import { ConfigLayer } from './config';
import { LoggerLayer } from './logger';

export const AppLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.merge(
    ConfigLayer,
    LoggerLayer.pipe(Layer.provide(ConfigLayer)),
  );
