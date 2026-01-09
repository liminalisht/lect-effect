import { type ConfigError, Layer } from 'effect';
import { type AppServices } from '../services';
import { type AppError } from '../errors';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';

// todo: replace ConfigError with union of all service errors
export const appLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
    greetingLayer,
  );
