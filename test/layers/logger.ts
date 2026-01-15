import { Layer } from 'effect';
import { loggerLayer } from '../../src/services/logger/layer';
import { testConfigLayer } from './config';

export const testLoggerLayer = loggerLayer.pipe(Layer.provide(testConfigLayer));
