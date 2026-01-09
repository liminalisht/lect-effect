import { Layer } from 'effect';
import { greetingLayer } from '../../src/layers/greeting';
import { testConfigLayer } from './config';
import { testLoggerLayer } from './logger';

export const testAppLayer = Layer.mergeAll(testConfigLayer, testLoggerLayer, greetingLayer);
