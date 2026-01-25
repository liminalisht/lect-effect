/**
 * Application layer composition.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type ConfigError } from 'effect/ConfigError';
import { type SqlError } from '@effect/sql/SqlError';
import { type MasterdataDbService } from '@lect-effect/services/masterdataDb';
import { type ItemRepoService } from '@lect-effect/services/itemRepo';
import { type ProductRepoService } from '@lect-effect/services/productRepo';
import { type AppConfigService } from '@lect-effect/services/appConfig';
import { type MasterdataDbConfigService } from '@lect-effect/services/masterdataDbConfig';
import { type GreetService } from '@lect-effect/services/greeting';
import { type AppServices } from '@lect-effect/services/app';
import { type AppError } from '../../errors.js';
import { loggerLayer } from '../logger/layer.js';
import { greetingLayer } from '../greeting/layer.js';
import { masterdataDbLayer } from '../masterdataDb/layer.js';
import { productRepoLayer } from '../productRepo/layer.js';
import { itemRepoLayer } from '../itemRepo/layer.js';
import { appConfigLayer } from '../appConfig/layer.js';
import { masterdataDbConfigLayer } from '../masterdataDbConfig/layer.js';

/**
 * Layer loading app configuration.
 * @since 1.0.0
 * @category Layers
 */
export const appConfig: Layer.Layer<AppConfigService, ConfigError> = appConfigLayer;
/**
 * Logger layer requiring app config.
 * @since 1.0.0
 * @category Layers
 *
 */
export const logger: Layer.Layer<never, never, AppConfigService> = loggerLayer;
/**
 * Logger provided with configuration.
 * @since 1.0.0
 * @category Layers
 */
export const configuredLogger: Layer.Layer<never, ConfigError> = logger.pipe(Layer.provide(appConfig));

/**
 * Layer loading DB configuration.
 * @since 1.0.0
 * @category Layers
 */
export const masterdataDbConfig: Layer.Layer<MasterdataDbConfigService, ConfigError> = masterdataDbConfigLayer;
/**
 * Raw masterdata DB layer.
 * @since 1.0.0
 * @category Layers
 */
export const masterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError, MasterdataDbConfigService> = masterdataDbLayer;
/**
 * Masterdata DB provided with configuration.
 * @since 1.0.0
 * @category Layers
 */
export const configuredMasterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError> = masterdataDb.pipe(Layer.provide(masterdataDbConfig));

/**
 * Product repository layer.
 * @since 1.0.0
 * @category Layers
 */
export const productRepo: Layer.Layer<ProductRepoService, SqlError | ConfigError, MasterdataDbService> = productRepoLayer;
/**
 * Item repository layer.
 * @since 1.0.0
 * @category Layers
 */
export const itemRepo: Layer.Layer<ItemRepoService, SqlError | ConfigError, MasterdataDbService> = itemRepoLayer;
/**
 * Combined repository layers with DB provided.
 * @since 1.0.0
 * @category Layers
 */
export const masterdataRepos: Layer.Layer<ProductRepoService | ItemRepoService, SqlError | ConfigError>
  = Layer.mergeAll(
    productRepo,
    itemRepo,
  ).pipe(Layer.provide(configuredMasterdataDb));

/**
 * Greeting service layer.
 * @since 1.0.0
 * @category Layers
 */
export const greeting: Layer.Layer<GreetService> = greetingLayer;

/**
 * Full application layer wiring services and infrastructure.
 * @since 1.0.0
 * @category Layers
 */
export const app: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    appConfig,
    configuredLogger,
    configuredMasterdataDb,
    greeting,
    masterdataRepos,
  );

/**
 * Exported application layer alias (memoized once per runtime).
 * @since 1.0.0
 * @category Layers
 */
export const appLayer: Layer.Layer<AppServices, AppError> = app;
