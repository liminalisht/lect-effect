import { type ConfigError, Layer } from 'effect';
import { type ConfigService } from '../services';
import { configLayer } from './config';
import { loggerLayer } from './logger';

export const appLayer: Layer.Layer<ConfigService, ConfigError.ConfigError>
  = Layer.merge(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );
