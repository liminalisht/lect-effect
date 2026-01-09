import { Layer } from 'effect';
import { greetingLayer } from '../../src/layers/greeting';
import { TestConfigLayer } from './config';
import { TestLoggerLayer } from './logger';

export const TestAppLayer = Layer.mergeAll(TestConfigLayer, TestLoggerLayer, greetingLayer);
