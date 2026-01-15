import { Layer } from 'effect';
import { greetingLayer } from '../../src/services/greeting/layer';
import { masterdataDbLayer } from '../../src/services/masterdataDb/layer';
import { type AppError } from '../../src/errors';
import { type AppServices } from '../../src/services/app/interface';
import { productRepoLayer } from '../../src/services/productRepo/layer';
import { itemRepoLayer } from '../../src/services/itemRepo/layer';
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

