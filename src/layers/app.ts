import { Layer } from 'effect';
import { type AppError } from '../errors';
import { type AppServices } from '../services';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';

export const appLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
    greetingLayer,
  );
