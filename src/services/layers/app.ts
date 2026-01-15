/**
 * Application layer composition.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type AppError } from '../../errors';
import { type AppServices } from '../interfaces/app';
import { configLayer } from './config';
import { loggerLayer } from './logger';
import { greetingLayer } from './greeting';
import { masterdataDbLayer } from './masterdataDb';
import { productRepoLayer } from './productRepo';
import { itemRepoLayer } from './itemRepo';

/**
 * Combines config and logger layers, wiring logger with config.
 * @since 1.0.0
 */
export const configAndLoggerLayer
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );

/**
 * Database layer with configuration/logging provided.
 * @since 1.0.0
 */
export const dbLayer = masterdataDbLayer.pipe(Layer.provide(configAndLoggerLayer));

// repos depend on db (and inherit logging/config via dbLayer’s construction context)
/**
 * Repository layer composition (product + item).
 * @since 1.0.0
 */
export const reposLayer = Layer.mergeAll(
  productRepoLayer,
  itemRepoLayer,
).pipe(Layer.provide(dbLayer));

/**
 * Full application layer wiring all dependencies.
 * @since 1.0.0
 */
export const appLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    configAndLoggerLayer,
    greetingLayer,
    dbLayer,
    reposLayer,
  );
