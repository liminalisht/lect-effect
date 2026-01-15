import { Layer } from 'effect';
import { greetingLayer } from '../../src/services/layers/greeting';
import { masterdataDbLayer } from '../../src/services/layers/masterdataDb';
import { type AppError } from '../../src/errors';
import { type AppServices } from '../../src/services/interfaces/app';
import { productRepoLayer } from '../../src/services/layers/productRepo';
import { itemRepoLayer } from '../../src/services/layers/itemRepo';
import { testLoggerLayer } from './logger';
import { testConfigLayer } from './config';

export const testConfigAndLoggerLayer
  = Layer.mergeAll(
    testConfigLayer,
    testLoggerLayer.pipe(Layer.provide(testConfigLayer)),
  );

export const testDbLayer = masterdataDbLayer.pipe(Layer.provide(testConfigAndLoggerLayer));

// test repos depend on test db (and inherit test logging/config via testDbLayer’s construction context)
export const testReposLayer = Layer.mergeAll(
  productRepoLayer,
  itemRepoLayer,
).pipe(Layer.provide(testDbLayer));

export const testAppLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    testConfigAndLoggerLayer,
    greetingLayer,
    testDbLayer,
    testReposLayer,
  );

