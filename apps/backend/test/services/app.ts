import { Layer } from 'effect';
import { type ConfigError } from 'effect/ConfigError';
import { type SqlError } from '@effect/sql/SqlError';
import { greetingLayer } from '../../src/services/greeting/layer.js';
import { masterdataDbLayer } from '../../src/services/masterdataDb/layer.js';
import { type AppError } from '../../src/errors.js';
import { type AppServices } from '@lect-effect/services/app';
import { productRepoLayer } from '../../src/services/productRepo/layer.js';
import { itemRepoLayer } from '../../src/services/itemRepo/layer.js';
import { type AppConfigService } from '@lect-effect/services/appConfig';
import { loggerLayer } from '../../src/services/logger/layer.js';
import { type MasterdataDbConfigService } from '@lect-effect/services/masterdataDbConfig';
import { type MasterdataDbService } from '@lect-effect/services/masterdataDb';
import { type ProductRepoService } from '@lect-effect/services/productRepo';
import { type ItemRepoService } from '@lect-effect/services/itemRepo';
import { type GreetService } from '@lect-effect/services/greeting';
import { testMasterdataDbConfigLayer } from './masterdataDbConfig/layer.js';
import { testAppConfigLayer } from './appConfig/layer.js';

export const testAppConfig: Layer.Layer<AppConfigService, ConfigError> = testAppConfigLayer; // different test implementation
export const testLogger: Layer.Layer<never, never, AppConfigService> = loggerLayer; // same live implementation
export const configuredTestLogger: Layer.Layer<never, ConfigError> = testLogger.pipe(Layer.provide(testAppConfig));

export const testMasterdataDbConfig: Layer.Layer<MasterdataDbConfigService, ConfigError> = testMasterdataDbConfigLayer; // different test implementation
export const testMasterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError, MasterdataDbConfigService> = masterdataDbLayer; // same live implementation
export const configuredTestMasterdataDb: Layer.Layer<MasterdataDbService, SqlError | ConfigError> = testMasterdataDb.pipe(Layer.provide(testMasterdataDbConfig));

export const testProductRepo: Layer.Layer<ProductRepoService, SqlError | ConfigError, MasterdataDbService> = productRepoLayer; // same live implementation
export const testItemRepo: Layer.Layer<ItemRepoService, SqlError | ConfigError, MasterdataDbService> = itemRepoLayer; // same live implementation
export const testMasterdataRepos: Layer.Layer<ProductRepoService | ItemRepoService, SqlError | ConfigError>
  = Layer.mergeAll(
    testItemRepo,
    testProductRepo,
  ).pipe(Layer.provide(configuredTestMasterdataDb));

export const testGreeting: Layer.Layer<GreetService> = greetingLayer; // same live implementation

export const testApp: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    testAppConfig,
    configuredTestLogger,
    configuredTestMasterdataDb,
    testGreeting,
    testMasterdataRepos,
  );

export const testAppLayer: Layer.Layer<AppServices, AppError> = testApp;

// export const testConfigAndLoggerLayer
//   = Layer.mergeAll(
//     testConfigLayer,
//     testLoggerLayer.pipe(Layer.provide(testConfigLayer)),
//   );

// export const testDbLayer = masterdataDbLayer.pipe(Layer.provide(testConfigAndLoggerLayer));

// // test repos depend on test db (and inherit test logging/config via testDbLayer’s construction context)
// export const testReposLayer = Layer.mergeAll(
//   productRepoLayer,
//   itemRepoLayer,
// ).pipe(Layer.provide(testDbLayer));

// // export const testAppLayer: Layer.Layer<AppServices, AppError>
// //   = Layer.mergeAll(
// //     testConfigAndLoggerLayer,
// //     greetingLayer,
// //     testDbLayer,
// //     testReposLayer,
// //   );

