import { Layer } from 'effect';
import { loggerLayer } from '../../src/services/layers/logger';
import { testConfigLayer } from './config';

export const testLoggerLayer = loggerLayer.pipe(Layer.provide(testConfigLayer));
