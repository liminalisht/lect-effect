import { Layer } from 'effect';
import { loggerLayer } from '../../src/layers/logger';
import { testConfigLayer } from './config';

export const testLoggerLayer = loggerLayer.pipe(Layer.provide(testConfigLayer));
