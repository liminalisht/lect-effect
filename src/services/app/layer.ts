/**
 * Application layer composition.
 * @since 1.0.0
 */
import { Layer } from 'effect';
import { type ConfigError } from 'effect/ConfigError';
import { type SqlError } from '@effect/sql/SqlError';
import { type AppError } from '../../errors';
import { loggerLayer } from '../logger/layer';
import { greetingLayer } from '../greeting/layer';
import { masterdataDbLayer } from '../masterdataDb/layer';
import { productRepoLayer } from '../productRepo/layer';
import { itemRepoLayer } from '../itemRepo/layer';
import { type MasterdataDbService } from '../masterdataDb/interface';
import { type ItemRepoService } from '../itemRepo/interface';
import { type ProductRepoService } from '../productRepo/interface';
import { type AppConfigService } from '../appConfig/interface';
import { appConfigLayer } from '../appConfig/layer';
import { masterdataDbConfigLayer } from '../masterdataDbConfig/layer';
import { type MasterdataDbConfigService } from '../masterdataDbConfig/interface';
import { type GreetService } from '../greeting/interface';
import { type AppServices } from './interface';

/**
 * Layer loading app configuration.
 * @since 1.0.0
 */
export const appConfig: Layer.Layer<AppConfigService, ConfigError> = appConfigLayer;
/**
 * Logger layer requiring app config.
 * @since 1.0.0
 */
export const logger: Layer.Layer<never, never, AppConfigService> = loggerLayer;
/**
 * Logger provided with configuration.
 * @since 1.0.0
 */
export const configuredLogger: Layer.Layer<never, ConfigError> = logger.pipe(Layer.provide(appConfig));

/**
 * Layer loading DB configuration.
 * @since 1.0.0
 */
export const masterdataDbConfig: Layer.Layer<MasterdataDbConfigService, ConfigError> = masterdataDbConfigLayer;
/**
 * Raw masterdata DB layer.
 * @since 1.0.0
 */
export const masterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError, MasterdataDbConfigService> = masterdataDbLayer;
/**
 * Masterdata DB provided with configuration.
 * @since 1.0.0
 */
export const configuredMasterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError> = masterdataDb.pipe(Layer.provide(masterdataDbConfig));

/**
 * Product repository layer.
 * @since 1.0.0
 */
export const productRepo: Layer.Layer<ProductRepoService, SqlError | ConfigError, MasterdataDbService> = productRepoLayer;
/**
 * Item repository layer.
 * @since 1.0.0
 */
export const itemRepo: Layer.Layer<ItemRepoService, SqlError | ConfigError, MasterdataDbService> = itemRepoLayer;
/**
 * Combined repository layers with DB provided.
 * @since 1.0.0
 */
export const masterdataRepos: Layer.Layer<ProductRepoService | ItemRepoService, SqlError | ConfigError>
  = Layer.mergeAll(
    productRepo,
    itemRepo,
  ).pipe(Layer.provide(configuredMasterdataDb));

/**
 * Greeting service layer.
 * @since 1.0.0
 */
export const greeting: Layer.Layer<GreetService> = greetingLayer;

/**
 * Full application layer wiring services and infrastructure.
 * @since 1.0.0
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
 * Exported application layer alias.
 * @since 1.0.0
 */
export const appLayer: Layer.Layer<AppServices, AppError> = app;

// /**
//  * Combines config and logger layers, wiring logger with config.
//  * @since 1.0.0
//  */
// export const appConfigAndLoggerLayer: Layer.Layer<AppConfigService, ConfigError>
//   = Layer.mergeAll(
//     appConfigLayer,
//     loggerLayer.pipe(Layer.provide(appConfigLayer)),
//   );

// /**
//  * Database layer with configuration/logging provided.
//  * @since 1.0.0
//  */
// export const dbLayer: Layer.Layer<MasterdataDbService, ConfigError | SqlError>
//   = masterdataDbLayer.pipe(Layer.provide(masterdataDbConfigLayer));

// // repos depend on db (and inherit logging/config via dbLayer’s construction context)
// /**
//  * Repository layer composition (product + item).
//  * @since 1.0.0
//  */
// export const reposLayer: Layer.Layer<ProductRepoService | ItemRepoService, SqlError | ConfigError>
//   = Layer.mergeAll(
//     productRepoLayer,
//     itemRepoLayer,
//   ).pipe(Layer.provide(dbLayer));

// // /**
// //  * Full application layer wiring all dependencies.
// //  * @since 1.0.0
// //  */
// // export const appLayer: Layer.Layer<AppServices, AppError>
// //   = Layer.mergeAll(
// //     configAndLoggerLayer,
// //     greetingLayer,
// //     dbLayer,
// //     reposLayer,
// //   );

// // /**
// //  * Full application layer wiring all dependencies.
// //  * @since 1.0.0
// //  */
// // export const appLayer: Layer.Layer<AppServices, AppError>
// //   =
// //   Layer.mergeAll(
// //     greetingLayer,
// //     itemRepoLayer,
// //     productRepoLayer,
// //   ).pipe(Layer.provideMerge(
// //     masterdataDbLayer
// //   )).pipe(Layer.provideMerge(
// //     loggerLayer
// //   )).pipe(Layer.provideMerge(
// //     configLayer
// //   ));

// // export const appLayer: Layer.Layer<AppServices, AppError>
// //   =
// //   Layer.mergeAll(
// //     greetingLayer,
// //     itemRepoLayer,
// //     productRepoLayer,
// //   ).pipe(Layer.provideMerge(
// //     masterdataDbLayer
// //   )).pipe(Layer.provideMerge(
// //     loggerLayer
// //   )).pipe(Layer.provideMerge(
// //     configLayer
// //   ));

