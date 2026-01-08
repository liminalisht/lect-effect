import { type ConfigError, Layer } from 'effect';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { type ConfigService } from '../services';

export const appLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.merge(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );
