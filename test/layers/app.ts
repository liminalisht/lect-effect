import { Layer } from 'effect';
import { greetingLayer } from '../../src/layers/greeting';
import { testConfigLayer } from './config';
import { testLoggerLayer } from './logger';
import { MasterdataDb } from '../../src/services/masterdataDb';
import { masterdataDbLayer } from '../../src/layers/masterdataDb';
import { AppError } from '../../src/errors';
import { AppServices } from '../../src/services';

export const testConfigAndLoggerLayer
  = Layer.mergeAll(
    testConfigLayer,
    testLoggerLayer.pipe(Layer.provide(testConfigLayer)),
  );

export const testDbLayer = masterdataDbLayer.pipe(Layer.provide(testConfigAndLoggerLayer));

export const testAppLayer: Layer.Layer<AppServices, AppError>
  = Layer.mergeAll(
    testConfigAndLoggerLayer,
    greetingLayer,
    testDbLayer,
  );

