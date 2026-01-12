import { Layer } from 'effect';
import { type AppError } from '../errors';
import { type AppServices } from '../services';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';
import { masterdataDbLayer } from './masterdataDb';
import { productRepoLayer } from './productRepo';
import { itemRepoLayer } from './itemRepo';

export const configAndLoggerLayer
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );

export const dbLayer = masterdataDbLayer.pipe(Layer.provide(configAndLoggerLayer));

// repos depend on db (and inherit logging/config via dbLayer’s construction context)
export const reposLayer = Layer.mergeAll(
  productRepoLayer,
  itemRepoLayer,
).pipe(Layer.provide(dbLayer));

export const appLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    configAndLoggerLayer,
    greetingLayer,
    dbLayer,
    reposLayer,
  );
