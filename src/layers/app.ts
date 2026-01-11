import { Layer } from 'effect';
import { type AppError } from '../errors';
import { type AppServices } from '../services';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';
import { masterdataDbLayer } from './masterdataDb';

export const configAndLoggerLayer
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );

export const dbLayer = masterdataDbLayer.pipe(Layer.provide(configAndLoggerLayer));

export const appLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    configAndLoggerLayer,
    greetingLayer,
    dbLayer,
  );
