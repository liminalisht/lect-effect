import { Layer } from 'effect';
import { greetingLayer } from '../../src/layers/greeting';
import { testConfigLayer } from './config';
import { testLoggerLayer } from './logger';
import { masterdataDbLayer } from '../../src/layers/masterdataDb';
import { AppError } from '../../src/errors';
import { AppServices } from '../../src/services';
import { productRepoLayer } from '../../src/layers/productRepo';
import { itemRepoLayer } from '../../src/layers/itemRepo';

export const testConfigAndLoggerLayer
  = Layer.mergeAll(
    testConfigLayer,
    testLoggerLayer.pipe(Layer.provide(testConfigLayer)),
  );

export const testDbLayer = masterdataDbLayer.pipe(Layer.provide(testConfigAndLoggerLayer));

// test repos depend on test db (and inherit test logging/config via testDbLayer’s construction context)
export const testReposLayer = Layer.mergeAll(
  productRepoLayer,
  itemRepoLayer
).pipe(Layer.provide(testDbLayer))


export const testAppLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    testConfigAndLoggerLayer,
    greetingLayer,
    testDbLayer,
    testReposLayer
  );

