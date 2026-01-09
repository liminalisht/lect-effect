import { Layer } from 'effect';
import { loggerLayer } from '../../src/layers/logger';
import { TestConfigLayer } from './config';

export const TestLoggerLayer = loggerLayer.pipe(Layer.provide(TestConfigLayer));
