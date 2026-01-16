/**
 * Application layer composition.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type ConfigError } from 'effect/ConfigError';
import { type SqlError } from '@effect/sql/SqlError';
import { type AppError } from '../../errors';
import { configLayer } from '../config/layer';
import { loggerLayer } from '../logger/layer';
import { greetingLayer } from '../greeting/layer';
import { masterdataDbLayer } from '../masterdataDb/layer';
import { productRepoLayer } from '../productRepo/layer';
import { itemRepoLayer } from '../itemRepo/layer';
import { type ConfigService } from '../config/interface';
import { type MasterdataDbService } from '../masterdataDb/interface';
import { type ItemRepoService } from '../itemRepo/interface';
import { type ProductRepoService } from '../productRepo/interface';
import { type AppServices } from './interface';

/**
 * Combines config and logger layers, wiring logger with config.
 * @since 1.0.0
 */
export const configAndLoggerLayer: Layer.Layer<ConfigService, ConfigError>
  = Layer.mergeAll(
    configLayer,
    loggerLayer.pipe(Layer.provide(configLayer)),
  );

/**
 * Database layer with configuration/logging provided.
 * @since 1.0.0
 */
export const dbLayer: Layer.Layer<MasterdataDbService, ConfigError | SqlError>
  = masterdataDbLayer.pipe(Layer.provide(configAndLoggerLayer));

// repos depend on db (and inherit logging/config via dbLayer’s construction context)
/**
 * Repository layer composition (product + item).
 * @since 1.0.0
 */
export const reposLayer: Layer.Layer<ProductRepoService | ItemRepoService, SqlError | ConfigError>
  = Layer.mergeAll(
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
